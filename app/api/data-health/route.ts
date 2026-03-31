import { NextResponse } from 'next/server';

export async function GET() {
    // Add logic here to retrieve data quality and stream health
    const dataQuality = 'Good'; // Example data quality status
    const streamHealth = 'Healthy'; // Example stream health status

    return NextResponse.json({ dataQuality, streamHealth });
}