import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const insights = [
    {
      id: 1,
      title: "The Future of Digital Transformation in Saudi Arabia",
      excerpt: "Explore how Vision 2030 is driving unprecedented digital transformation across the Kingdom.",
      author: "Ahmed Mohammed",
      date: "August 15, 2025",
      readTime: "5 min read",
      category: "Digital Transformation"
    },
    {
      id: 2,
      title: "Cybersecurity Trends: What to Expect in 2025",
      excerpt: "Discover the emerging cybersecurity threats and innovative solutions shaping the security landscape.",
      author: "Sarah Khalil",
      date: "August 10, 2025",
      readTime: "7 min read",
      category: "Cybersecurity"
    },
    {
      id: 3,
      title: "PDPL Compliance: A Complete Guide for Saudi Businesses",
      excerpt: "Everything you need to know about Personal Data Protection Law compliance implementation.",
      author: "Mohammed Al-Rashid",
      date: "August 5, 2025",
      readTime: "10 min read",
      category: "PDPL"
    }
  ];

  const offerings = [
    {
      title: "Enterprise Solutions",
      description: "Comprehensive digital transformation solutions for large organizations with complex requirements.",
      icon: "🏢",
      features: ["Scalable Architecture", "Enterprise Security", "24/7 Support", "Custom Integration"]
    },
    {
      title: "SME Solutions",
      description: "Cost-effective technology solutions designed specifically for small and medium enterprises.",
      icon: "💼",
      features: ["Quick Implementation", "Affordable Pricing", "Local Support", "Growth Ready"]
    },
    {
      title: "Government Services",
      description: "Specialized solutions meeting the unique requirements of government entities and public sector.",
      icon: "🏛️",
      features: ["Compliance Ready", "Security Certified", "Audit Trails", "Regulatory Support"]
    },
    {
      title: "Startup Acceleration",
      description: "Technology solutions and consulting to help startups scale rapidly and efficiently.",
      icon: "🚀",
      features: ["MVP Development", "Growth Strategy", "Investor Ready", "Market Entry"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      
      {/* Digital Transformation Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Take Lead on a Future-Ready <span className="gradient-text">DIGITAL TRANSFORMATION</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Innovators race on Innovative Ways. We guide organizations through transformative journeys, enabling them to modernize technology, secure systems, analyze data, and revolutionize customer experiences.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Why Choose InnovWayz?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span>Local expertise with global standards</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span>Proven track record in digital transformation</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span>End-to-end solution delivery</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center">
                <h4 className="text-xl font-semibold mb-4">Read Our Latest Report</h4>
                <p className="text-gray-600 mb-6">Discover the latest trends in digital transformation and cybersecurity</p>
                <button className="btn-primary">Download Report <ArrowRight className="w-4 h-4 ml-2" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Offerings Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Offerings</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored solutions for organizations of all sizes and sectors
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {offerings.map((offering, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-gray-100">
                <div className="text-4xl mb-4 text-center">{offering.icon}</div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 text-center">{offering.title}</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">{offering.description}</p>
                <div className="space-y-2">
                  {offering.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 btn-primary">Learn More</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Latest <span className="gradient-text">Insights</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay ahead of the curve with expert insights and industry trends
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {insights.map((insight) => (
              <article key={insight.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-48 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-sm">{insight.category}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {insight.category}
                    </span>
                    <span className="text-gray-500 text-xs">{insight.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900 line-clamp-2">
                    {insight.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {insight.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {insight.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-gray-600">{insight.author}</span>
                    </div>
                    <a href="/insights" className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors flex items-center">
                      Read <ArrowRight className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <a href="/insights" className="btn-primary">
              View All Insights
            </a>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Cutting-edge solutions that drive innovation and business growth</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <SolutionCard
              title="PDPL Compliance Solutions"
              description="Strategic data privacy solutions that build trust, enhance reputation, and fuel business growth in Saudi Arabia."
              features={["Regulatory compliance", "Data protection", "Trust building", "Business growth"]}
              buttonText="Check Our Solutions"
            />
            <SolutionCard
              title="Rapid Applications Development"
              description="Low-code development services that turn visionary ideas into pixel-perfect web and mobile apps in record time."
              features={["Low-code platform", "Fast development", "Custom solutions", "Innovation focus"]}
              buttonText="Check Our Solutions"
            />
            <SolutionCard
              title="DevOps Services"
              description="Holistic DevOps strategy that bridges development and operations to streamline software delivery and fuel innovation."
              features={["CI/CD pipelines", "Automation", "Monitoring", "Performance optimization"]}
              buttonText="Check Our Offerings"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Get In Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Ready to transform your business? Let&apos;s discuss how InnovWayz can help you achieve your goals.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                    <MapPinIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Office Address</p>
                    <p className="text-gray-600">Office # 2, Building # 9353<br/>Shaddad Al Fahri Street, AL MALAZ District<br/>Riyadh, Saudi Arabia 12642</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <MailIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-600">info@innovwayz.com</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                </div>
                <button type="submit" className="w-full btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold gradient-text mb-4">InnovWayz</h3>
              <p className="text-gray-400">Transforming businesses through innovative technology solutions and expert consulting services.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Rapid Application Development</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cyber Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Digitalization</a></li>
                <li><a href="#" className="hover:text-white transition-colors">PDPL Consulting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Quality Assurance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Talent Acquisition</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DevOps Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fintech Integration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <LinkedinIcon className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <TwitterIcon className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors">
                  <FacebookIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 by InnovWayz Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function SolutionCard({ title, description, features, buttonText }: {
  title: string;
  description: string;
  features: string[];
  buttonText: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg card-hover">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            {feature}
          </li>
        ))}
      </ul>
      <button className="btn-primary w-full">{buttonText}</button>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
    </svg>
  );
}
