import { NextResponse } from 'next/server';
import { saveContactForm, getAllContactForms } from '@/utils/contactFormsService';

export async function POST(request) {
  try {
    const body = await request.json();
    const id = await saveContactForm(body);
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