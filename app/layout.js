import "./globals.css";

export const metadata = {
  title: "Workout Tracker",
  description: "Kişisel antrenman takip uygulaması",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return <html lang="tr"><body>{children}</body></html>;
}
