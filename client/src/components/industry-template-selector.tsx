import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Code, 
  Building2, 
  HeartPulse, 
  GraduationCap, 
  Utensils,
  DollarSign,
  Plane,
  Home,
  Music,
  Palette,
  Factory,
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IndustryTemplateProps {
  onSelect: (template: string) => void;
}

interface IndustryCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  templates: IndustryTemplate[];
}

interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export function IndustryTemplateSelector({ onSelect }: IndustryTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const industryCategories: IndustryCategory[] = [
    {
      id: 'ecommerce',
      name: 'E-commerce',
      icon: <ShoppingCart className="w-5 h-5" />,
      templates: [
        {
          id: 'marketplace',
          name: 'Marketplace Platform',
          description: 'A platform connecting buyers and sellers',
          prompt: 'An online marketplace connecting buyers with independent sellers for [PRODUCTS], featuring ratings, secure payments, and logistics support.'
        },
        {
          id: 'subscription',
          name: 'Subscription Box',
          description: 'Regularly delivered curated products',
          prompt: 'A subscription box service delivering curated [PRODUCTS] to customers monthly, featuring personalization and surprise elements.'
        },
        {
          id: 'dtc',
          name: 'Direct-to-Consumer Brand',
          description: 'Brand selling products directly to consumers',
          prompt: 'A direct-to-consumer brand selling premium [PRODUCTS] with an emphasis on quality, sustainability, and brand storytelling.'
        }
      ]
    },
    {
      id: 'tech',
      name: 'Technology',
      icon: <Code className="w-5 h-5" />,
      templates: [
        {
          id: 'saas',
          name: 'SaaS Platform',
          description: 'Software-as-a-Service solution',
          prompt: 'A SaaS platform that helps businesses with [PROBLEM], offering features like analytics, automation, and team collaboration.'
        },
        {
          id: 'mobile_app',
          name: 'Mobile App',
          description: 'Consumer-focused mobile application',
          prompt: 'A mobile app that helps users [SOLUTION], with features like personalization, social sharing, and smart recommendations.'
        },
        {
          id: 'ai_tool',
          name: 'AI-Powered Tool',
          description: 'Tool leveraging artificial intelligence',
          prompt: 'An AI-powered tool that [SOLUTION] for [TARGET AUDIENCE], leveraging machine learning to improve [OUTCOME].'
        }
      ]
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: <DollarSign className="w-5 h-5" />,
      templates: [
        {
          id: 'fintech_app',
          name: 'Fintech App',
          description: 'Financial technology application',
          prompt: 'A fintech app that helps users [FINANCIAL GOAL], with features like automated saving, investment options, and financial education.'
        },
        {
          id: 'crypto',
          name: 'Crypto/Blockchain',
          description: 'Cryptocurrency or blockchain solution',
          prompt: 'A blockchain-based platform for [USE CASE], offering decentralized [SOLUTION] with transparency and security features.'
        },
        {
          id: 'insurtech',
          name: 'InsurTech Solution',
          description: 'Insurance technology innovation',
          prompt: 'An insurtech solution that makes [TYPE] insurance more accessible through digital processes, personalized policies, and quick claims.'
        }
      ]
    },
    {
      id: 'health',
      name: 'Healthcare',
      icon: <HeartPulse className="w-5 h-5" />,
      templates: [
        {
          id: 'telehealth',
          name: 'Telehealth Platform',
          description: 'Remote healthcare services',
          prompt: 'A telehealth platform connecting patients with healthcare providers for [HEALTH NEEDS], featuring secure video consultations and digital prescriptions.'
        },
        {
          id: 'health_app',
          name: 'Health & Wellness App',
          description: 'App for improving health outcomes',
          prompt: 'A health and wellness app focused on [HEALTH GOAL], with personalized plans, progress tracking, and community support.'
        },
        {
          id: 'medtech',
          name: 'MedTech Device',
          description: 'Medical technology hardware',
          prompt: 'A medical device that monitors/treats [HEALTH CONDITION], improving patient outcomes through [TECHNOLOGY] and data-driven insights.'
        }
      ]
    },
    {
      id: 'education',
      name: 'Education',
      icon: <GraduationCap className="w-5 h-5" />,
      templates: [
        {
          id: 'online_courses',
          name: 'Online Learning Platform',
          description: 'Digital education delivery',
          prompt: 'An online learning platform offering courses in [SUBJECTS], with interactive lessons, certification, and personalized learning paths.'
        },
        {
          id: 'edtech',
          name: 'EdTech Tool',
          description: 'Educational technology solution',
          prompt: 'An educational technology tool that helps [AUDIENCE] learn [SUBJECT/SKILL] more effectively through [APPROACH].'
        },
        {
          id: 'language',
          name: 'Language Learning App',
          description: 'App for language acquisition',
          prompt: 'A language learning app that uses [METHOD] to help users quickly become conversational in new languages.'
        }
      ]
    },
    {
      id: 'food',
      name: 'Food & Beverage',
      icon: <Utensils className="w-5 h-5" />,
      templates: [
        {
          id: 'delivery',
          name: 'Food Delivery Service',
          description: 'Food ordering and delivery',
          prompt: 'A food delivery service connecting users with [TYPE] restaurants, offering fast delivery, order tracking, and loyalty programs.'
        },
        {
          id: 'cloud_kitchen',
          name: 'Cloud Kitchen Brand',
          description: 'Delivery-only food concept',
          prompt: 'A cloud kitchen brand specializing in [CUISINE], operating without a storefront and optimized for delivery.'
        },
        {
          id: 'food_tech',
          name: 'Food Technology',
          description: 'Innovative food production',
          prompt: 'A food technology startup producing [FOOD PRODUCT] using innovative methods like [TECHNOLOGY], focusing on sustainability and nutrition.'
        }
      ]
    },
  ];

  const handleSelectTemplate = (template: IndustryTemplate) => {
    onSelect(template.prompt);
    toast({
      title: 'Template Selected',
      description: `Using template: ${template.name}. Edit the prompt to customize it further.`,
    });
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-white mb-4">Select Industry Template</h3>
      
      {/* Industry categories */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {industryCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-20 p-2 ${
              selectedCategory === category.id 
                ? 'bg-vision-primary-gradient text-white' 
                : 'bg-vision-card/40 border-vision-purple-200/20 text-white hover:bg-vision-purple-100/10'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <div className="mb-1">{category.icon}</div>
            <span className="text-xs text-center">{category.name}</span>
          </Button>
        ))}
      </div>
      
      {/* Templates for selected category */}
      {selectedCategory && (
        <div className="space-y-3">
          <h4 className="text-white/80 font-medium mb-2">Select a template:</h4>
          {industryCategories
            .find(cat => cat.id === selectedCategory)
            ?.templates.map((template) => (
              <div 
                key={template.id}
                className="p-4 bg-vision-card/40 border border-vision-purple-200/20 rounded-lg cursor-pointer hover:border-vision-purple-500 transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <h5 className="font-medium text-white mb-1">{template.name}</h5>
                <p className="text-white/60 text-sm">{template.description}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}