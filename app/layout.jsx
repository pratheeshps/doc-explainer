import './globals.css';

export const metadata = {
  title: 'Doc Explainer',
  description: 'Ask questions about any document and get plain-language answers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
