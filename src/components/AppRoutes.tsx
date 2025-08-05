import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { LearnPage } from '../pages/LearnPage';
import { LegalPage } from '../pages/LegalPage';
import { ContactPage } from '../pages/ContactPage';
import { ShippingPage } from '../pages/ShippingPage';
import { LabResultsPage } from '../pages/LabResultsPage';
import { CareersPage } from '../pages/CareersPage';
import { HoldingsPage } from '../pages/HoldingsPage';
import { TechIPPage } from '../pages/TechIPPage';
import { DistributionPage } from '../pages/DistributionPage';
import { WholesalePage } from '../pages/WholesalePage';
import { PrivateLabelPage } from '../pages/PrivateLabelPage';
import { FarmsPage } from '../pages/FarmsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

interface AppRoutesProps {
  isStateBlocked: boolean;
}

export const AppRoutes = ({ isStateBlocked }: AppRoutesProps) => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage isStateBlocked={isStateBlocked} />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/shipping" element={<ShippingPage />} />
      <Route path="/lab-results" element={<LabResultsPage />} />
      <Route path="/careers" element={<CareersPage />} />
      <Route path="/holdings" element={<HoldingsPage />} />
      <Route path="/tech-ip" element={<TechIPPage />} />
      <Route path="/distribution" element={<DistributionPage />} />
      <Route path="/wholesale" element={<WholesalePage />} />
      <Route path="/private-label" element={<PrivateLabelPage />} />
      <Route path="/farms" element={<FarmsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
