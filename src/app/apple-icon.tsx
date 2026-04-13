import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: 'linear-gradient(to bottom right, #3B82F6, #1E3A8A)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '40px', // Standard apple rounded curves relative to 180
          fontWeight: 900,
          border: '4px solid #60A5FA',
          boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3)'
        }}
      >
        <span style={{ marginTop: '-10px' }}>M</span>
        <div style={{ position: 'absolute', right: '28px', top: '28px', backgroundColor: '#EF4444', height: '24px', width: '24px', borderRadius: '50%', border: '4px solid white' }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
