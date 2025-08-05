import { SEOHead } from '../components/SEOHead';

export const CareersPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-risevia-dark to-risevia-darker pt-24 pb-16">
      <SEOHead
        title="Careers - RiseViA"
        description="Join the RiseViA team. We're looking for passionate individuals to help grow our premium THCA cannabis business."
        canonical="https://risevia.com/careers"
      />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Join the RiseViA Team</h1>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
          <p className="text-gray-200 mb-6">
            We're always looking for passionate individuals to join our growing team.
          </p>
          <form className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300" />
            <input type="email" placeholder="Email" className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300" />
            <input type="tel" placeholder="Phone" className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300" />
            <textarea placeholder="Tell us about yourself" rows={4} className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300" />
            <button type="submit" className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-full">
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
