import { NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/adminAuth';
import { 
  getFooterData, 
  updateFooterData, 
  updateFooterSection,
  addFooterLink,
  removeFooterLink,
  updateSocialLinks,
  addSocialLink,
  removeSocialLink,
  resetFooterToDefaults
} from '@/utils/footerService';

// GET - Get footer data
export async function GET() {
  try {
    const result = await getFooterData();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error in GET /api/admin/footer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update footer data
export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    let result;

    switch (action) {
      case 'update_general':
        result = await updateFooterData({
          description: data.description,
          copyright: data.copyright,
          developer_credit: data.developer_credit
        });
        break;

      case 'update_section':
        result = await updateFooterSection(data.sectionId, {
          title: data.title
        });
        break;

      case 'add_link':
        result = await addFooterLink(data.sectionId, {
          text: data.text,
          href: data.href,
          id: data.id
        });
        break;

      case 'remove_link':
        result = await removeFooterLink(data.sectionId, data.linkId);
        break;

      case 'update_social_links':
        result = await updateSocialLinks(data.socialLinks);
        break;

      case 'add_social_link':
        result = await addSocialLink(data);
        break;

      case 'remove_social_link':
        result = await removeSocialLink(data.socialLinkId);
        break;

      case 'reset_to_defaults':
        result = await resetFooterToDefaults();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error in POST /api/admin/footer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
