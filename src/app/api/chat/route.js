import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare conversation history for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an AI Career Assistant named "Genie" that EXCLUSIVELY helps users with career-related topics. You must ONLY respond to questions about:

CAREER-RELATED TOPICS ONLY:
- Resume writing, optimization, and formatting
- Job search strategies and techniques
- Interview preparation and techniques
- Career planning and development
- Professional networking and LinkedIn
- Skill development and certifications
- Industry insights and trends
- Job applications and cover letters
- Salary negotiation
- Professional development
- Workplace communication
- Career transitions
- Remote work and job opportunities
- Job market analysis
- Professional branding

IMPORTANT RULES:
1. If the user asks about ANYTHING not career-related (politics, weather, sports, entertainment, personal life, etc.), politely redirect them to career topics
2. Use this exact response for non-career topics: "I'm here specifically to help with career-related questions like resume writing, job search strategies, interview preparation, and professional development. How can I assist you with your career goals today?"
3. Format your responses with clear paragraphs, bullet points, and structure for better readability
4. Keep responses concise but informative (2-4 paragraphs max)
5. Be friendly, professional, and encouraging
6. Provide practical, actionable advice
7. Use a warm, supportive tone

Remember: You are STRICTLY a career assistant. Never respond to non-career topics.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 600,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 