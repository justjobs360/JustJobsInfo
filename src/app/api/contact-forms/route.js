import { NextResponse } from 'next/server';
import { saveContactForm, getAllContactForms } from '@/utils/contactFormsService';
import BrevoService from '@/utils/brevoService';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Save the contact form to database
    const id = await saveContactForm(body);
    
    // Send email notification to admin addresses
    try {
      const brevoService = new BrevoService();
      const emailResult = await brevoService.sendContactFormNotification({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        message: body.message,
        formType: body.formType || 'contact'
      });
      
      if (emailResult.success) {
        console.log('Contact form notification sent successfully');
      } else {
        console.error('Failed to send contact form notification:', emailResult.error);
        // Don't fail the request if email fails, just log it
      }
    } catch (emailError) {
      console.error('Error sending contact form notification:', emailError);
      // Don't fail the request if email fails, just log it
    }
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const forms = await getAllContactForms();
    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 