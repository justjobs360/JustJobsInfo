import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    
    console.log('Geolocate API called with:', { lat, lon });
    
    if (!lat || !lon) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing coordinates' 
      }, { status: 400 });
    }

    console.log('Converting coordinates to country:', lat, lon);

    // Use Nominatim (OpenStreetMap) API to convert coordinates to country
    // This API properly handles coordinates and is free to use
    // Added 'accept-language=en' to get English names
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=3&addressdetails=1&accept-language=en`;
    console.log('Calling Nominatim API:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'JustJobsInfo/1.0', // Required by Nominatim
        'Accept-Language': 'en' // Request English language
      }
    });
    
    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch location data' 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('Nominatim API response:', data);

    if (data && data.address && data.address.country) {
      return NextResponse.json({
        success: true,
        country: data.address.country,
        city: data.address.city || data.address.town || data.address.village,
        region: data.address.state || data.address.region
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No country data found'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Geolocation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 