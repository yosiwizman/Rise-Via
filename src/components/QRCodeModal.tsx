import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import QRCode from 'react-qr-code';
import { Button } from './ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coaUrl: string;
  batchId: string;
  strainName: string;
}

export const QRCodeModal = ({ isOpen, onClose, coaUrl, batchId, strainName }: QRCodeModalProps) => {
  const qrValue = coaUrl === '#' ? `https://risevia.com/coa/${batchId}` : coaUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-risevia-charcoal border-risevia-purple text-white">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">
            Certificate of Analysis
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and download the Certificate of Analysis for {strainName} batch {batchId}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 text-center">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{strainName}</h3>
            <p className="text-gray-400">Batch ID: {batchId}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg inline-block">
            <QRCode
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={qrValue}
              viewBox="0 0 256 256"
            />
          </div>
          
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">
              Scan QR code to view Certificate of Analysis
            </p>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => window.open(qrValue, '_blank')}
                className="flex-1 bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View COA
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `COA-${batchId}.png`;
                  link.href = qrValue;
                  link.click();
                }}
                variant="outline"
                className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            {coaUrl === '#' && (
              <p className="text-yellow-400 text-xs">
                Lab results available upon request
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
