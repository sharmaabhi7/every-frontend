import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const { config } = useSiteConfig();

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-indigo-600">
                {config.navbarTitle}
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => scrollToSection('home')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'home'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'about'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'contact'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Contact
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional
              <span className="text-indigo-600"> Data Entry</span>
              <br />
              Work Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our platform for reliable data entry work opportunities. 
              Complete projects with deadlines, track your progress, and get paid for quality work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Start Working Today
              </Link>
              <button
                onClick={() => scrollToSection('about')}
                className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">
                Streamlined workflow with automated tracking and deadline management.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Digital agreements, secure authentication, and protected user data.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Real-time progress monitoring with deadline alerts and status updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About Our Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive data entry work management system with built-in 
              quality control, deadline tracking, and automated workflow management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                How It Works
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Register & Verify</h4>
                    <p className="text-gray-600">
                      Create your account, verify your email, and sign the digital agreement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Start Working</h4>
                    <p className="text-gray-600">
                      Begin your data entry work with provided project links and credentials.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Submit & Review</h4>
                    <p className="text-gray-600">
                      Complete your work within the 4-day deadline and submit for review.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Key Features
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="text-green-500 mr-3">✓</div>
                  <span>4-day work completion deadline</span>
                </li>
                <li className="flex items-center">
                  <div className="text-green-500 mr-3">✓</div>
                  <span>Automatic deadline alerts</span>
                </li>
                <li className="flex items-center">
                  <div className="text-green-500 mr-3">✓</div>
                  <span>Real-time progress tracking</span>
                </li>
                <li className="flex items-center">
                  <div className="text-green-500 mr-3">✓</div>
                  <span>Digital agreement signing</span>
                </li>
                <li className="flex items-center">
                  <div className="text-green-500 mr-3">✓</div>
                  <span>24-hour review period</span>
                </li>
                <li className="flex items-center">
                  <div className="text-green-500 mr-3">✓</div>
                  <span>Admin dashboard monitoring</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our platform? Need support with your work? 
              We're here to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="text-indigo-600 mr-4 text-xl">📧</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Email Support</h4>
                    <p className="text-gray-600">bforboll81@gmail.com</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-indigo-600 mr-4 text-xl">⏰</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Support Hours</h4>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-indigo-600 mr-4 text-xl">🚀</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Quick Start</h4>
                    <p className="text-gray-600">Ready to begin? Register now and start working today!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">How long do I have to complete work?</h4>
                  <p className="text-gray-600 text-sm">You have 4 days from when you start the work to complete and submit it.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">What happens if I miss the deadline?</h4>
                  <p className="text-gray-600 text-sm">Automatic penalties are applied for late submissions to maintain quality standards.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">How do I track my progress?</h4>
                  <p className="text-gray-600 text-sm">Your dashboard shows real-time progress, deadlines, and status updates.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Is my data secure?</h4>
                  <p className="text-gray-600 text-sm">Yes, we use secure authentication and digital agreements to protect your information.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-indigo-400 mb-4">
                {config.navbarTitle}
              </div>
              <p className="text-gray-400">
                Professional data entry work platform with automated workflow management 
                and quality control systems.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/admin-login" className="text-gray-400 hover:text-white transition-colors">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: {config.footerEmail}</li>
                <li className="text-gray-400">Phone: {config.footerContactNumber}</li>
                <li className="text-gray-400">Address: {config.footerAddress}</li>
                <li className="text-gray-400">Response: Within 24 hours</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 {config.navbarTitle}. All rights reserved. Built with MERN Stack.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
