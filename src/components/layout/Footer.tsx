import {
    siInstagram,
    siFacebook,
    siX, SimpleIcon
} from 'simple-icons/icons'

const SocialIcon = ({ icon, href }: { icon: SimpleIcon, href: string }) => (
    <a
        href={href}
        className="text-stone-400 hover:text-white transition-colors"
        target="_blank"
        rel="noopener noreferrer"
    >
        <svg
            role="img"
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-current"
        >
            <path d={icon.path} />
        </svg>
    </a>
)
import { Button } from "@/components/ui/button";

export default function Footer() {
    return (
        <footer className="bg-stone-900 text-stone-200">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-4">
                        <h3 className="font-display text-2xl mb-6">King William Hotel</h3>
                        <p className="text-stone-400 leading-relaxed mb-8">
                            Since 1923, the King William Hotel has stood as a beacon of refined hospitality in Ontario, welcoming distinguished guests with timeless elegance and impeccable service.
                        </p>
                        <div className="flex space-x-6">
                            <SocialIcon icon={siInstagram} href="" />
                            <SocialIcon icon={siFacebook} href="" />
                            <SocialIcon icon={siX} href="" />
                        </div>
                    </div>

                    <div className="md:col-span-4 md:px-8">
                        <h4 className="font-display text-lg mb-6">Exclusive Services</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-white mb-1">Concierge Desk</p>
                                <p className="text-stone-400">Available 24/7 for your needs</p>
                            </div>
                            <div>
                                <p className="text-white mb-1">Fine Dining</p>
                                <p className="text-stone-400">Reservations: (289) 123-4567</p>
                            </div>
                            <div>
                                <p className="text-white mb-1">Special Events</p>
                                <p className="text-stone-400">events@kingwilliamhotel.ca</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <h4 className="font-display text-lg mb-6">Contact & Location</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-white mb-1">Address</p>
                                <p className="text-stone-400">123 Royal Road</p>
                                <p className="text-stone-400">Ontario, Canada</p>
                            </div>
                            <div>
                                <p className="text-white mb-1">Reservations</p>
                                <a href="" className="text-stone-400 hover:text-white transition-colors">
                                    (289) 123-4567
                                </a>
                            </div>
                            <div>
                                <p className="text-white mb-1">Email</p>
                                <a href="mailto:reservations@kingwilliamhotel.ca" className="text-stone-400 hover:text-white transition-colors">
                                    reservations@kingwilliamhotel.ca
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-stone-700 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-stone-400 text-sm">
                        © {new Date().getFullYear()} King William Hotel. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6 mt-4 md:mt-0">
                        <Button variant="ghost" className="text-stone-400 hover:text-black">
                            Guest Portal
                        </Button>
                        <span className="text-stone-600">|</span>
                        <Button variant="ghost" className="text-stone-400 hover:text-black">
                            Staff Access
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    )
}