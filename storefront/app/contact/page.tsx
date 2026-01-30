export default function ContactUsPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white py-20 border-b">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-black text-gray-900 mb-4">Contact Us</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Have questions? We're here to help. Reach out to us via any of the channels below.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">Get in Touch</h2>
                            <div className="space-y-6">
                                <div className="flex gap-6 items-start">
                                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-primary/20">
                                        📍
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">Office Address</h3>
                                        <p className="text-gray-500 leading-relaxed">
                                            123, Leewaa Plaza, Main Road,<br />
                                            Industrial Area, New Delhi - 110001
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-primary/20">
                                        📞
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">Phone & Support</h3>
                                        <p className="text-gray-500">+91 98765 43210</p>
                                        <p className="text-gray-500">+91 12345 67890</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-primary/20">
                                        📧
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">Email Support</h3>
                                        <p className="text-gray-500">support@leewaa.com</p>
                                        <p className="text-gray-500">info@leewaa.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-primary rounded-[2rem] text-white">
                            <h3 className="text-2xl font-bold mb-2">Service Hours</h3>
                            <p className="opacity-80 mb-4 font-medium">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                            <p className="opacity-80 font-medium">Sunday: Emergency Services Only</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h2>
                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">First Name</label>
                                    <input type="text" placeholder="John" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Last Name</label>
                                    <input type="text" placeholder="Doe" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Email Address</label>
                                <input type="email" placeholder="john@example.com" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Subject</label>
                                <select className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition bg-white">
                                    <option>General Inquiry</option>
                                    <option>Sales Inquiry</option>
                                    <option>Service Request</option>
                                    <option>Feedback</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 font-medium">Message</label>
                                <textarea rows={4} placeholder="How can we help you?" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition resize-none"></textarea>
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-700 transition-all hover:scale-[1.02]">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Google Map Mockup */}
            <div className="container mx-auto px-4 pb-16">
                <div className="bg-gray-200 rounded-[3rem] h-[400px] flex items-center justify-center text-gray-400 font-bold overflow-hidden shadow-inner border border-gray-100">
                    <p>Map Placeholder - [Google Maps Embed would go here]</p>
                </div>
            </div>
        </div>
    );
}
