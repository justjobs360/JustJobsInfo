import "../../public/assets/css/plugins/fontawesome.css";
import "../../public/assets/css/plugins/magnifying-popup.css";
import "../../public/assets/css/plugins/swiper.css";
import "../../public/assets/css/plugins/metismenu.css";
import "../../public/assets/css/vendor/bootstrap.min.css";
import 'react-modal-video/css/modal-video.min.css';

// Import your custom styles LAST to override plugin styles
import "../../public/assets/css/style.css";

import ClientLayout from '@/components/layout/ClientLayout';

export const metadata = {
  title: "JustJobsInfo - Professional Resume and Career Services",
  description: "Professional resume writing services, career guidance, and job search resources to help you land your dream job.",
  icons: {
    icon: "/assets/images/logo/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='index-one'>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
