import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean & Refined */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Small label */}
          <div className="inline-block">
            <span className="text-sm font-medium text-pitt-gray-500 tracking-wide uppercase">
              Pittsburgh Carpooling
            </span>
          </div>
          
          {/* Main Heading - Large but refined */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-pitt-black leading-[1.1] tracking-tight">
            The smarter way to
            <br />
            share your commute
          </h1>
          
          <p className="text-lg sm:text-xl text-pitt-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect with verified riders and drivers in Pittsburgh. 
            Save money, reduce traffic, build community.
          </p>
          
          {/* CTAs */}
          {user ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link to="/dashboard" className="btn-primary px-8 py-3">
                Dashboard
              </Link>
              <Link to="/find-ride" className="btn-tertiary px-8 py-3">
                Find a Ride
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link to="/register" className="btn-primary px-8 py-3">
                Get Started
              </Link>
              <Link to="/login" className="btn-tertiary px-8 py-3">
                Sign In
              </Link>
            </div>
          )}
          
          {/* Subtle social proof */}
          <p className="text-sm text-pitt-gray-500 pt-6">
            Trusted by <span className="font-semibold text-pitt-black">2,000+</span> Pittsburgh commuters
          </p>
        </div>
      </section>

      {/* Features - Clean Grid */}
      <section className="py-20 px-6 bg-pitt-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Find Rides',
                description: 'Search by route, time, and price. Book in seconds.'
              },
              {
                title: 'Earn Money',
                description: 'Turn your commute into income. You set the price.'
              },
              {
                title: 'Stay Safe',
                description: 'Verified IDs, ratings, and secure in-app messaging.'
              }
            ].map((feature, i) => (
              <div key={i} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-pitt-black text-white flex items-center justify-center font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-pitt-black">
                  {feature.title}
                </h3>
                <p className="text-pitt-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats - Minimal */}
      <section className="py-20 px-6 bg-white border-y border-pitt-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { value: '2,000+', label: 'Active Riders' },
              { value: '15,000+', label: 'Rides Completed' },
              { value: '$120K', label: 'Money Saved' },
              { value: '4.8', label: 'Avg. Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-pitt-black mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-pitt-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Simple */}
      {!user && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold text-pitt-black leading-tight">
              Ready to start saving?
            </h2>
            <p className="text-lg text-pitt-gray-600">
              Join Pittsburgh's carpooling community today.
            </p>
            <div className="pt-4">
              <Link to="/register" className="btn-primary px-8 py-3 text-lg">
                Get Started
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

