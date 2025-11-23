import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;