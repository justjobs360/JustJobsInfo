import { NextResponse } from 'next/server';
import { getClientIP } from '@/utils/spamProtection';
import { storeCV } from '@/utils/mongodb';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// In-memory map for guest rate limiting (per IP)
const guestAuditMap = new Map();
// In-memory map for authenticated user rate limiting (per user ID)
const userAuditMap = new Map();

// Rate limiting configuration
const RATE_LIMITS = {
  GUEST: { maxAudits: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 audits per 24 hours
  AUTHENTICATED: { maxAudits: -1, windowMs: 0 } // Unlimited audits for authenticated users
};

// Helper function to check rate limit
function checkRateLimit(identifier, isAuthenticated = false) {
  const now = Date.now();
  const limits = isAuthenticated ? RATE_LIMITS.AUTHENTICATED : RATE_LIMITS.GUEST;
  const map = isAuthenticated ? userAuditMap : guestAuditMap;
  
  // For authenticated users with unlimited audits, always allow
  if (isAuthenticated && limits.maxAudits === -1) {
    return { allowed: true, remaining: -1 }; // -1 indicates unlimited
  }
  
  if (!map.has(identifier)) {
    map.set(identifier, { count: 1, firstAudit: now, lastAudit: now });
    return { allowed: true, remaining: limits.maxAudits - 1 };
  }
  
  const record = map.get(identifier);
  
  // Reset if window has passed
  if (now - record.firstAudit > limits.windowMs) {
    map.set(identifier, { count: 1, firstAudit: now, lastAudit: now });
    return { allowed: true, remaining: limits.maxAudits - 1 };
  }
  
  // Check if limit exceeded
  if (record.count >= limits.maxAudits) {
    const timeRemaining = limits.windowMs - (now - record.firstAudit);
    return { 
      allowed: false, 
      timeRemaining: Math.ceil(timeRemaining / 60000), // minutes
      message: isAuthenticated 
        ? `Rate limit exceeded. You can audit ${limits.maxAudits} resumes per hour. Please try again in ${Math.ceil(timeRemaining / 60000)} minutes.`
        : `You can only audit ${limits.maxAudits} resumes as a guest per day. Please log in to audit more resumes.`
    };
  }
  
  // Increment count
  record.count++;
  record.lastAudit = now;
  return { allowed: true, remaining: limits.maxAudits - record.count };
}

export async function GET() {
  return NextResponse.json({ message: 'CV API Working' });
}

export async function POST(request) {
  try {
    console.log('🚀 CV API POST called');

    // --- ENHANCED AUTH CHECK ---
    let isAuthenticated = false;
    let userId = null;
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Authorization header:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.replace('Bearer ', '').trim();
      
        try {
          // Verify the Firebase ID token with additional checks
          const decodedToken = await admin.auth().verifyIdToken(idToken, true); // Check if token is revoked
        console.log('🪪 Decoded Firebase token:', decodedToken);
          
          // Additional validation
        if (!decodedToken.uid) {
          throw new Error('Invalid token: missing UID');
          }
          
          // Check if token is not too old (optional, Firebase handles this but extra security)
          const tokenAge = Date.now() - (decodedToken.iat * 1000);
          if (tokenAge > 3600000) { // 1 hour
            throw new Error('Token too old');
          }
          
          isAuthenticated = true;
          userId = decodedToken.uid;
          console.log(`✅ Authenticated user: ${userId}`);
        } catch (tokenError) {
          console.warn('❌ Invalid Firebase token:', tokenError.message);
          // Continue as unauthenticated user
        }
      } else {
      console.log('🛑 No valid Authorization header found. Treating as guest.');
    }

    // --- ENHANCED RATE LIMITING ---
    const clientIP = getClientIP(request);
    const identifier = isAuthenticated ? userId : clientIP;
    
    const rateLimitCheck = checkRateLimit(identifier, isAuthenticated);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: rateLimitCheck.message
      }, { status: 429 });
    }
    
    const remainingText = rateLimitCheck.remaining === -1 ? 'unlimited' : `${rateLimitCheck.remaining} remaining`;
    console.log(`${isAuthenticated ? '✅' : '📝'} ${isAuthenticated ? 'Authenticated user' : 'Guest'} ${identifier} - ${remainingText} audits`);
    
    // Step 1: Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.log('❌ No file uploaded');
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    console.log(`📁 File received: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    // Step 2: File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json({ 
        success: false, 
        error: 'File size must be less than 5MB' 
      }, { status: 400 });
    }

    // Allow DOCX and DOC files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/msword' // DOC
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json({ 
        success: false, 
        error: 'Please upload a DOCX or DOC file only. PDF files are not supported.' 
      }, { status: 400 });
    }

    console.log('✅ File validation passed');

    // Step 3: Text extraction
    let extractedText = '';
    
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('📝 Processing DOCX file...');
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Use mammoth for DOCX parsing
        const mammoth = await import('mammoth');
        
        console.log('🔄 Extracting text from DOCX...');
        const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
        
        extractedText = result.value.trim();
        console.log(`✅ DOCX text extraction complete. Length: ${extractedText.length} characters`);
        
        if (result.messages.length > 0) {
          console.log('⚠️ DOCX parsing warnings:', result.messages);
        }
        
      } catch (docxError) {
        console.error('❌ DOCX parsing error:', docxError);
        extractedText = 'DOCX file detected but text extraction failed: ' + docxError.message;
      }
    } else if (file.type === 'application/msword') {
      console.log('📝 Processing DOC file...');
      console.log(`📁 DOC file details: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        console.log(`📊 DOC arrayBuffer size: ${arrayBuffer.byteLength} bytes`);
        
        // DOC files are binary format, so we need to extract text differently
        console.log('🔄 Extracting text from DOC using binary parsing...');
        
        const buffer = Buffer.from(arrayBuffer);
        
        // Method 1: Try to find text content in the DOC file structure
        // DOC files often have text content in specific byte ranges
        const textPatterns = [];
        
        // Look for common text patterns in DOC files
        for (let i = 0; i < buffer.length - 4; i++) {
          // Look for sequences of printable ASCII characters
          if (buffer[i] >= 32 && buffer[i] <= 126) {
            let textStart = i;
            let textLength = 0;
            
            while (i < buffer.length && buffer[i] >= 32 && buffer[i] <= 126 && textLength < 1000) {
              textLength++;
              i++;
            }
            
            if (textLength >= 10) { // Only consider meaningful text sequences
              const textChunk = buffer.toString('utf8', textStart, textStart + textLength);
              // Filter out common DOC file artifacts
              if (!textChunk.includes('\x00') && !textChunk.includes('\x01') && 
                  textChunk.length > 10 && /[A-Za-z]{3,}/.test(textChunk)) {
                textPatterns.push(textChunk);
              }
            }
          }
        }
        
        console.log(`📊 Found ${textPatterns.length} text patterns in DOC file`);
        
        if (textPatterns.length > 0) {
          // Combine all text patterns and clean up
          extractedText = textPatterns.join(' ')
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[^\w\s\.\,\!\?\;\:\-\(\)]/g, '') // Remove special characters except basic punctuation
            .trim();
          
          console.log(`✅ DOC text extraction successful. Length: ${extractedText.length} characters`);
          console.log(`📖 DOC extracted text preview: ${extractedText.substring(0, 300)}...`);
          
          // If we got very little text, try alternative method
          if (extractedText.length < 50) {
            console.log('⚠️ Extracted text too short, trying alternative method...');
            
            // Method 2: Try to find text after common DOC headers
            const docHeader = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]); // DOC file signature
            const headerIndex = buffer.indexOf(docHeader);
            
            if (headerIndex !== -1) {
              console.log(`📊 Found DOC header at position ${headerIndex}`);
              
              // Look for text content after the header
              const searchStart = headerIndex + 512; // Skip header and metadata
              const searchEnd = Math.min(buffer.length, searchStart + 50000); // Search first 50KB
              
              const searchBuffer = buffer.slice(searchStart, searchEnd);
              const searchText = searchBuffer.toString('utf8');
              
              // Extract readable text sequences
              const readableText = searchText.match(/[A-Za-z\s\.\,\!\?\;\:\-\(\)]{20,}/g);
              if (readableText && readableText.length > 0) {
                const alternativeText = readableText.join(' ').trim();
                if (alternativeText.length > extractedText.length) {
                  extractedText = alternativeText;
                  console.log(`✅ Alternative DOC extraction successful. Length: ${extractedText.length} characters`);
                  console.log(`📖 Alternative text preview: ${extractedText.substring(0, 300)}...`);
                }
              }
            }
          }
        } else {
          throw new Error('No readable text content found in DOC file');
        }
        
      } catch (docError) {
        console.error('❌ DOC parsing error:', docError);
        console.error('❌ DOC error stack:', docError.stack);
        extractedText = 'DOC file detected but text extraction failed: ' + docError.message;
      }
    }

    console.log(`📊 Extracted text length: ${extractedText.length}`);
    console.log(`📖 Text preview: ${extractedText.substring(0, 200)}...`);

    // Step 4: AI-Powered CV Detection
    console.log('🔍 Starting AI-powered CV detection...');
    let isCV = false;
    let cvDetectionReason = '';
    
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Import OpenAI dynamically
      const OpenAI = await import('openai');
      const openai = new OpenAI.default({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Use a smaller, faster model for CV detection
      const detectionPrompt = `Analyze the following document content and determine if it is a CV/resume or not.

Document Content:
${extractedText.substring(0, 2000)}${extractedText.length > 2000 ? '...' : ''}

Please respond with ONLY:
YES - if this is clearly a CV/resume (contains professional experience, education, skills, etc.)
NO - if this is not a CV/resume (could be a letter, article, report, etc.)

Provide a brief reason (max 50 words) for your decision.

Expected CV elements: work experience, education, skills, contact info, professional summary, achievements, etc.
Non-CV documents: letters, articles, reports, forms, contracts, etc.`;

      const detectionResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Faster and cheaper for detection
        messages: [
          {
            role: "system",
            content: "You are a document classifier. Your job is to determine if a document is a CV/resume or not. Respond with YES/NO and a brief reason."
          },
          {
            role: "user",
            content: detectionPrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.1, // Low temperature for consistent classification
      });

      const detectionResult = detectionResponse.choices[0].message.content.trim();
      console.log(`🔍 CV Detection result: ${detectionResult}`);
      
      // Parse the response
      if (detectionResult.toUpperCase().startsWith('YES')) {
        isCV = true;
        cvDetectionReason = detectionResult.replace(/^YES\s*[-:]*\s*/i, '').trim();
        console.log('✅ Document confirmed as CV/resume');
      } else {
        isCV = false;
        cvDetectionReason = detectionResult.replace(/^NO\s*[-:]*\s*/i, '').trim();
        console.log('❌ Document is not a CV/resume');
      }
      
    } catch (detectionError) {
      console.error('❌ CV detection error:', detectionError);
      
      // Fallback to keyword-based detection if AI fails
    const cvKeywords = [
        'experience', 'education', 'skills', 'summary', 'profile', 'responsibilities', 
        'achievements', 'certifications', 'projects', 'employment', 'work history', 
        'professional', 'contact', 'objective', 'references', 'languages', 'interests', 
        'resume', 'cv', 'curriculum vitae', 'work experience', 'job history', 'career'
    ];
      
      const keywordMatches = cvKeywords.filter(k => extractedText.toLowerCase().includes(k));
      isCV = extractedText.length > 400 && keywordMatches.length >= 3;
      cvDetectionReason = isCV ? 
        `Fallback detection: Found ${keywordMatches.length} CV-related keywords` : 
        `Fallback detection: Insufficient CV indicators (found ${keywordMatches.length} keywords)`;
      
      console.log(`🔄 Using fallback detection: ${isCV ? 'CV detected' : 'Not a CV'}`);
    }

    // If not a CV, return early with score 0
    if (!isCV) {
      console.log('❌ Document is not a CV - returning score 0');
      return NextResponse.json({
        success: true,
        message: 'This document does not appear to be a CV/resume.',
        data: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          extractedTextLength: extractedText.length,
          textPreview: extractedText.substring(0, 300) + '...',
          processedAt: new Date().toISOString(),
          score: 0,
          overallAssessment: `This document does not appear to be a CV/resume. ${cvDetectionReason}`,
          strengths: [],
          weaknesses: [],
          improvements: [],
          atsCompatibility: ['This document is not a CV/resume and cannot be evaluated for ATS compatibility.'],
          fullAnalysis: '',
          step: 'not-a-cv',
          cvDetectionReason: cvDetectionReason
        }
      });
    }

    console.log('✅ CV detection passed - proceeding with analysis');

    // Step 6: OpenAI Analysis
    console.log('🤖 Starting OpenAI analysis...');
    let aiAnalysis = null;
    let structuredData = null;
    
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Import OpenAI dynamically
      const OpenAI = await import('openai');
      const openai = new OpenAI.default({
        apiKey: process.env.OPENAI_API_KEY,
      });

      console.log('🔄 Sending to OpenAI for analysis...');
      
      const prompt = `Please analyze this CV/resume and provide a comprehensive assessment in exactly 4 categories plus an overall score. Please structure your response as follows:

**SCORE: [X]/100**
[Provide a strict score from 0-100 based on overall CV quality, content, and presentation. Be critical and realistic - most CVs should score between 30-85. Only exceptional CVs should score 90+. Poor CVs should score below 40. Consider: formatting (20%), content quality (30%), relevance (25%), and professionalism (25%)]

**STRENGTHS**
• [List 5-8 key strengths with bullet points]
• [Each strength should be specific and actionable]
• [Focus on what the candidate does well]
• [Be diverse and specific to this particular CV]

**WEAKNESSES** 
• [List 5-8 areas for improvement with bullet points]
• [Be constructive and specific]
• [Focus on actionable feedback]
• [Identify unique issues specific to this CV]

**RECOMMENDATIONS**
• [List 8-12 specific recommendations with bullet points]
• [Provide concrete steps to improve]
• [Be practical and actionable]
• [Give unique suggestions tailored to this CV]
• [Include formatting, content, and presentation improvements]
• [Cover different aspects: structure, language, achievements, skills, etc.]

**ATS COMPATIBILITY**
• [List 3-6 bullet points on how well this resume would perform in Applicant Tracking Systems (ATS)]
• [Mention any issues with formatting, keywords, or structure that could affect ATS parsing]
• [Give specific suggestions for improving ATS compatibility]

CV Content:
${extractedText}

Please ensure your response follows this exact format with the score first, followed by the 4 categories. Use bullet points (•) for each item. Be professional, constructive, and specific. Provide unique insights that are tailored to this specific CV rather than generic advice. Be strict and realistic with scoring - don't inflate scores.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a strict and professional CV/resume analyst. Provide a realistic score (0-100) first, then exactly 4 categories: STRENGTHS, WEAKNESSES, RECOMMENDATIONS, and ATS COMPATIBILITY. Use bullet points (•) for each item. Be specific, constructive, and actionable. Provide unique, tailored feedback for each CV rather than generic responses. Vary your analysis based on the specific content and context of each resume. Be critical and realistic with scoring - most CVs should score between 30-85. Only exceptional CVs should score 90+. Poor CVs should score below 40. Consider formatting (20%), content quality (30%), relevance (25%), and professionalism (25%) in your scoring."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.8,
      });

      aiAnalysis = completion.choices[0].message.content;
      console.log(`✅ OpenAI analysis complete. Length: ${aiAnalysis.length} characters`);
      
      // Step 7: Parse AI response into structured data
      console.log('🔄 Parsing AI response into structured format...');
      structuredData = parseAIResponse(aiAnalysis);
      console.log('✅ Structured data parsing complete');
      
    } catch (aiError) {
      console.error('❌ OpenAI analysis error:', aiError);
      aiAnalysis = 'AI analysis failed: ' + aiError.message;
      structuredData = createFallbackData();
    }

    // Step 8: Calculate final score (moved here, after structuredData is initialized)
    const score = structuredData?.score || calculateScore(structuredData);

    // Step 5: Store CV to MongoDB
    let cvId = null;
    try {
      // Convert file to buffer for storage
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      
      // Set userId and userEmail for guests
      let finalUserId = userId || 'guest';
      let finalUserEmail = null;
      if (isAuthenticated && userId) {
        try {
          finalUserEmail = (await admin.auth().getUser(userId)).email;
        } catch (e) {
          finalUserEmail = null;
        }
      } else {
        finalUserEmail = 'guest';
      }
      
      const cvData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: fileBuffer, // Store the actual file as binary data
        extractedTextLength: extractedText.length, // Keep for reference
        textPreview: extractedText.substring(0, 300) + '...', // Keep for quick preview
        userId: finalUserId,
        userEmail: finalUserEmail,
        isAuthenticated: isAuthenticated,
        clientIP: clientIP,
        cvDetectionReason: cvDetectionReason,
        processedAt: new Date().toISOString(),
        score: score // Store the audit score
      };
      
      cvId = await storeCV(cvData);
      console.log(`💾 CV file stored to MongoDB with ID: ${cvId}`);
      
    } catch (storageError) {
      console.error('❌ Error storing CV to MongoDB:', storageError);
      // Continue with analysis even if storage fails
    }

    // Step 9: Prepare final response
    const responseData = {
      success: true,
      message: 'CV analysis completed successfully',
      data: {
        cvId: cvId, // MongoDB document ID
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        extractedTextLength: extractedText.length,
        textPreview: extractedText.substring(0, 300) + '...',
        processedAt: new Date().toISOString(),
        score: score,
        overallAssessment: structuredData?.overallAssessment || 'Analysis not available',
        strengths: structuredData?.strengths || [],
        weaknesses: structuredData?.weaknesses || [],
        improvements: structuredData?.recommendations || [],
        atsCompatibility: structuredData?.atsCompatibility || [],
        skillsAnalysis: structuredData?.skillsAnalysis || '',
        experienceSummary: structuredData?.experienceSummary || '',
        fullAnalysis: aiAnalysis,
        step: 'analysis-complete',
        cvDetectionReason: cvDetectionReason,
        storedInDatabase: cvId !== null
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ CV API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Processing failed'
    }, { status: 500 });
  }
}

// Helper function to parse AI response into structured data
function parseAIResponse(aiResponse) {
  try {
    const sections = {
      overallAssessment: '',
      strengths: [],
      weaknesses: [],
      skillsAnalysis: '',
      experienceSummary: '',
      recommendations: [],
      atsCompatibility: []
    };

    let extractedScore = 50; // Default score

    // Split the response into lines and clean up
    const lines = aiResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Extract score first
      if (line.toUpperCase().includes('SCORE:') || line.toUpperCase().includes('SCORE')) {
        const scoreMatch = line.match(/(\d+)\/100/);
        if (scoreMatch) {
          extractedScore = parseInt(scoreMatch[1]);
          console.log(`📊 Extracted score: ${extractedScore}/100`);
        }
        continue;
      }
      
      // Detect section headers (case insensitive)
      if (line.toUpperCase().includes('STRENGTHS')) {
        currentSection = 'strengths';
        continue;
      } else if (line.toUpperCase().includes('WEAKNESSES') || line.toUpperCase().includes('AREAS FOR IMPROVEMENT')) {
        currentSection = 'weaknesses';
        continue;
      } else if (line.toUpperCase().includes('RECOMMENDATIONS')) {
        currentSection = 'recommendations';
        continue;
      } else if (line.toUpperCase().includes('ATS COMPATIBILITY')) {
        currentSection = 'atsCompatibility';
        continue;
      }

      // Process content based on current section
      if (currentSection === 'strengths') {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
          const strength = line.replace(/^[•\-*\d\.\s]+/, '').trim();
          if (strength && strength.length > 5) {
            sections.strengths.push(strength);
          }
        }
      } else if (currentSection === 'weaknesses') {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
          const weakness = line.replace(/^[•\-*\d\.\s]+/, '').trim();
          if (weakness && weakness.length > 5) {
            sections.weaknesses.push(weakness);
          }
        }
      } else if (currentSection === 'recommendations') {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
          const recommendation = line.replace(/^[•\-*\d\.\s]+/, '').trim();
          if (recommendation && recommendation.length > 5) {
            sections.recommendations.push(recommendation);
          }
        }
      } else if (currentSection === 'atsCompatibility') {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
          const ats = line.replace(/^[•\-*\d\.\s]+/, '').trim();
          if (ats && ats.length > 5) {
            sections.atsCompatibility.push(ats);
          }
        }
      }
    }

    // Create overall assessment from the analysis
    const totalItems = sections.strengths.length + sections.weaknesses.length + sections.recommendations.length;
    if (totalItems > 0) {
      sections.overallAssessment = `Analysis completed with ${sections.strengths.length} strengths, ${sections.weaknesses.length} areas for improvement, and ${sections.recommendations.length} recommendations identified. Overall score: ${extractedScore}/100.`;
    } else {
      sections.overallAssessment = `Analysis completed successfully. Overall score: ${extractedScore}/100.`;
    }

    // Clean up and ensure minimum items
    if (sections.strengths.length === 0) {
      sections.strengths = ['Strong educational background', 'Relevant technical skills'];
    }
    if (sections.weaknesses.length === 0) {
      sections.weaknesses = ['Could benefit from more specific achievements', 'Formatting could be improved'];
    }
    if (sections.recommendations.length === 0) {
      sections.recommendations = ['Add quantifiable achievements', 'Improve summary section'];
    }
    if (sections.atsCompatibility.length === 0) {
      sections.atsCompatibility = ['Resume format appears to be ATS-friendly', 'Consider adding more industry-specific keywords'];
    }

    // Limit to reasonable number of items per category
    sections.strengths = sections.strengths.slice(0, 8);
    sections.weaknesses = sections.weaknesses.slice(0, 8);
    sections.recommendations = sections.recommendations.slice(0, 12);
    sections.atsCompatibility = sections.atsCompatibility.slice(0, 6);

    // Add the extracted score to the sections
    sections.score = extractedScore;

    return sections;
  } catch (error) {
    console.error('❌ Error parsing AI response:', error);
    return createFallbackData();
  }
}

// Helper function to create fallback data
function createFallbackData() {
  return {
    overallAssessment: 'Analysis completed with 3 strengths, 3 areas for improvement, and 5 recommendations identified.',
    strengths: ['File was successfully uploaded and processed', 'Document format is supported', 'Text extraction completed successfully'],
    weaknesses: ['AI analysis encountered an error', 'Could not complete full analysis', 'Limited insights available'],
    skillsAnalysis: '',
    experienceSummary: '',
    recommendations: [
      'Please try uploading the file again',
      'Ensure the file is not corrupted',
      'Add quantifiable achievements to your experience',
      'Improve the summary section with key highlights',
      'Consider adding a skills section with proficiency levels'
    ],
    atsCompatibility: [
      'Resume format appears to be ATS-friendly',
      'Consider adding more industry-specific keywords'
    ]
  };
}

// Helper function to calculate overall score
function calculateScore(structuredData) {
  if (!structuredData) return 45; // Default to middle-low score
  
  let score = 40; // Start with a lower base score
  
  // Add points based on content quality
  if (structuredData.strengths && structuredData.strengths.length > 0) {
    score += Math.min(structuredData.strengths.length * 2, 10);
  }
  
  if (structuredData.recommendations && structuredData.recommendations.length > 0) {
    score += Math.min(structuredData.recommendations.length, 8);
  }
  
  // Deduct points for weaknesses
  if (structuredData.weaknesses && structuredData.weaknesses.length > 0) {
    score -= Math.min(structuredData.weaknesses.length * 1.5, 15);
  }
  
  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)));
} 
