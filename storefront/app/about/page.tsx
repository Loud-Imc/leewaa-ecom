export default function AboutUsPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="bg-primary py-20 text-white text-center">
                <h1 className="text-5xl font-black mb-4">About Leewaa</h1>
                <p className="text-xl text-primary-100 max-w-2xl mx-auto px-4">
                    Committed to providing pure, healthy, and safe drinking water for every household.
                </p>
            </div>

            <div className="container mx-auto px-4 py-16 space-y-24">
                {/* Mission Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            At Leewaa, we believe that access to clean drinking water is a fundamental right. Our mission is to bridge the gap between technology and health by providing state-of-the-art water purification systems that are both effective and affordable.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We specialize in advanced RO and Alkaline technologies, ensuring that your water is not just filtered, but also mineral-rich and healthy for your family.
                        </p>
                    </div>
                    <div className="bg-gray-100 rounded-3xl h-80 flex items-center justify-center text-4xl overflow-hidden shadow-xl">
                        💧
                    </div>
                </div>

                {/* Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition">
                        <div className="text-4xl mb-4">✨</div>
                        <h3 className="text-xl font-bold mb-2">Quality First</h3>
                        <p className="text-gray-500">We use only the highest grade components for our filters, ensuring long-lasting performance.</p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition">
                        <div className="text-4xl mb-4">🤝</div>
                        <h3 className="text-xl font-bold mb-2">Customer Focus</h3>
                        <p className="text-gray-500">Our relationship with you doesn't end at the sale. We provide 24/7 support for all our systems.</p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition">
                        <div className="text-4xl mb-4">🌱</div>
                        <h3 className="text-xl font-bold mb-2">Sustainable Health</h3>
                        <p className="text-gray-500">Promoting health through essential minerals and reduced plastic waste from bottled water.</p>
                    </div>
                </div>

                {/* Why Us? */}
                <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <h2 className="text-4xl font-black mb-6">Why Choose Leewaa?</h2>
                        <p className="text-gray-400 text-lg">
                            With over a decade of experience in water treatment, we understand the unique challenges of local water quality. Our custom-tailored solutions ensure you get exactly what you need.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
