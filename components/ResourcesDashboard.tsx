import React from 'react';
import { BugAntIcon, LeafIcon, SparklesIcon, CloudRainIcon, ClockIcon, ExternalLinkIcon } from './Icons';

const resources = [
  { 
    title: 'Pest Identification Guide', 
    description: 'Learn to identify common pests affecting your crops.', 
    icon: BugAntIcon,
    url: 'https://extension.umd.edu/resource/pest-identification'
  },
  { 
    title: 'Organic Farming Basics', 
    description: 'An introduction to sustainable and organic farming principles.', 
    icon: LeafIcon,
    url: 'https://rodaleinstitute.org/why-organic/organic-farming-basics/organic-basics/'
  },
  { 
    title: 'Soil Health 101', 
    description: 'Discover tips and techniques for maintaining rich, healthy soil.', 
    icon: SparklesIcon,
    url: 'https://www.nrcs.usda.gov/getting-assistance/soil-health/soil-health-101'
  },
  { 
    title: 'Water Conservation', 
    description: 'Effective strategies for water management on your farm.', 
    icon: CloudRainIcon,
    url: 'https://www.fao.org/land-water/water/water-management/en/'
  },
  { 
    title: 'Seasonal Planting Calendar', 
    description: 'A guide to help you decide what to plant and when.', 
    icon: ClockIcon,
    url: 'https://www.almanac.com/gardening/planting-calendar'
  },
];

const ResourceCard: React.FC<{ title: string; description: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; url: string }> = ({ title, description, icon: Icon, url }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-background rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-sm text-text-secondary mt-1">{description}</p>
            </div>
            <ExternalLinkIcon className="w-5 h-5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
    </a>
);

export const ResourcesDashboard: React.FC = () => (
  <div className="p-4 bg-surface rounded-lg shadow-lg">
    <h3 className="text-xl font-bold text-text-primary">Knowledge Base</h3>
    <p className="mt-2 mb-4 text-text-secondary">Guides and best practices to help you succeed.</p>
    <div className="space-y-3">
      {resources.map((resource) => (
        <ResourceCard key={resource.title} {...resource} />
      ))}
    </div>
  </div>
);