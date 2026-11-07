import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Poppins } from 'next/font/google';
export const metadata: Metadata = {
    title: {
        template: '%s | AISDR',
        default: 'AISDR - Dashboard',
    },
};
const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap', // Ensures text is visible during webfont loading
    variable: '--font-poppins', // Custom variable for easy usage
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
    
    return (
        <html lang="en">
            <body className={poppins.variable}>
                <Toaster />
                <ProviderComponent >{children}</ProviderComponent>
            </body>
        </html>
    );
}
