interface FeatureCardProps {
  title: string;
  description: string;
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      <h3 className="text-xl font-medium text-gray-900 mb-4">
        {title}
      </h3>
      <p className="text-gray-600 font-light leading-relaxed">
        {description}
      </p>
    </div>
  );
}
