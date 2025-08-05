import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { LearnPage } from '../pages/LearnPage';
import { LegalPage } from '../pages/LegalPage';
import { ContactPage } from '../pages/ContactPage';
import { ShippingPage } from '../pages/ShippingPage';
import { LabResultsPage } from '../pages/LabResultsPage';
import { CareersPage } from '../pages/CareersPage';
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
