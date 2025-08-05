import { SEOHead } from '../components/SEOHead';

export const LabResultsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-risevia-dark to-risevia-darker pt-24 pb-16">
      <SEOHead
        title="Lab Results - RiseViA"
        description="Third-party lab testing results for RiseViA THCA products. View certificates of analysis and compliance data."
        canonical="https://risevia.com/lab-results"
      />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Lab Results</h1>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
          <h2 className="text-2xl text-white mb-4">Third-Party Lab Testing</h2>
          <p className="text-gray-200 mb-6">
            All RiseViA products undergo rigorous third-party lab testing to ensure:
          </p>
          <ul className="text-gray-200 space-y-2 mb-6">
            <li>• Accurate THCa percentages</li>
            <li>• Less than 0.3% Delta-9 THC (federal compliance)</li>
            <li>• No pesticides, heavy metals, or contaminants</li>
            <li>• Microbial safety testing</li>
            <li>• Terpene profile analysis</li>
          </ul>
          <p className="text-gray-200">
            Certificates of Analysis (COAs) are available for all products upon request.
          </p>
        </div>
      </div>
    </div>
  );
};
