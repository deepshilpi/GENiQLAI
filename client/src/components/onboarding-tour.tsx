import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

interface OnboardingTourProps {
  onComplete: () => void;
  showTour: boolean;
}

export function OnboardingTour({ onComplete, showTour }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { user } = useAuth();

  const tourSteps: TourStep[] = [
    {
      target: '#prompt-input',
      title: 'Enter Your Startup Idea',
      content: 'Describe your startup idea in detail to get comprehensive AI-powered analysis.',
      position: 'top',
    },
    {
      target: '#analysis-types',
      title: 'Multiple Analysis Types',
      content: 'GENIQL provides 8 different analysis types for your startup idea.',
      position: 'right',
    },
    {
      target: '#plan-features',
      title: 'Upgrade Your Plan',
      content: 'Unlock more detailed analyses with our Pro and Unicorn plans.',
      position: 'left',
    },
    {
      target: '#community-section',
      title: 'Community Features',
      content: 'Connect with other entrepreneurs, share ideas, and get feedback.',
      position: 'bottom',
    },
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show tour when prop changes
  useEffect(() => {
    if (showTour && user) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [showTour, user]);

  // Handle each step's positioning
  useEffect(() => {
    if (isOpen && currentStep < tourSteps.length) {
      const targetElement = document.querySelector(tourSteps[currentStep].target);
      if (targetElement) {
        scrollToElement(targetElement as HTMLElement);
      }
    }
  }, [currentStep, isOpen]);

  const scrollToElement = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const isInViewport =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= windowSize.height &&
      rect.right <= windowSize.width;

    if (!isInViewport) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const getStepPosition = (step: TourStep) => {
    const targetElement = document.querySelector(step.target) as HTMLElement;
    if (!targetElement) return { top: 0, left: 0 };

    const rect = targetElement.getBoundingClientRect();
    let top, left;

    switch (step.position) {
      case 'top':
        top = rect.top - 10 - 120; // height of tooltip
        left = rect.left + rect.width / 2 - 150; // center of target, half width of tooltip
        break;
      case 'right':
        top = rect.top + rect.height / 2 - 60;
        left = rect.right + 10;
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - 150;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - 60;
        left = rect.left - 10 - 300; // width of tooltip
        break;
      default:
        top = rect.bottom + 10;
        left = rect.left;
    }

    // Make sure tooltip stays within viewport
    if (left < 10) left = 10;
    if (left > windowSize.width - 310) left = windowSize.width - 310;
    if (top < 10) top = 10;
    if (top > windowSize.height - 130) top = windowSize.height - 130;

    return { top, left };
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    setCurrentStep(0);
    onComplete();
  };

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];
  const position = getStepPosition(currentTourStep);

  return (
    <>
      {/* Backdrop / overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleComplete} />

      {/* Tooltip */}
      <div
        className="fixed z-50 w-[300px] bg-vision-card/90 backdrop-blur-sm text-white rounded-xl shadow-lg p-4 border border-vision-purple-400/20"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{currentTourStep.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white/70 hover:text-white hover:bg-vision-purple-100/10"
            onClick={handleComplete}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-white/70 mb-4">{currentTourStep.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-vision-purple-500' : 'bg-vision-purple-300/30'
                }`}
              />
            ))}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-white border-vision-purple-200/20 hover:bg-vision-purple-100/10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            {currentStep < tourSteps.length - 1 ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-vision-primary-gradient hover:brightness-110 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                className="bg-vision-primary-gradient hover:brightness-110 text-white"
              >
                Complete
                <Check className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}