import './globals.css';

export const metadata = {
  title: 'Insovant — Autonomous Financial Reconciliation Platform',
  description: 'Insovant AI Finance Controller for Razorpay settlement reconciliation, Q&A, tax matching, and cash forecasting.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Premium Fontshare Switzer Font Family */}
        <link href="https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600,700,800,900,301,401,501,601,701,801,901&display=swap" rel="stylesheet" />
        {/* Premium Display Serif Fonts: Instrument Serif & Playfair */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <div className="app-layout" style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
