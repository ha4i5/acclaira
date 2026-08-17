import "./globals.css";
export const metadata = {
  title: "Acclaira — One headline. Post. Article. Video.",
  description: "AI viral news content: branded posts, SEO articles on WordPress, and Urdu voice-over videos.",
};
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
