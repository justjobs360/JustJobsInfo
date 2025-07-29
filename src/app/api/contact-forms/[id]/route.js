import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/utils/mongodb';

const CONTACT_FORMS_COLLECTION = 'contactForms';

async function getContactFormsCollection() {
  return getCollection(CONTACT_FORMS_COLLECTION);
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const collection = await getContactFormsCollection();
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid form ID format' },
        { status: 400 }
      );
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Form submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Form submission deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting contact form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete form submission' },
      { status: 500 }
    );
  }
} 