import React, { useEffect, useState } from 'react';

/**
 * React Integration Example for SecureWeb
 * 
 * Add the script tag to your public/index.html:
 * <script src="https://cdn.yourdomain.com/secureweb.js" data-api-key="your-api-key"></script>
 */

interface SecureWebInstance {
  getCSRFToken: () => string;
  updateConfig: (config: any) => void;
}

declare global {
  interface Window {
    SecureWeb?: SecureWebInstance;
  }
}

const SecureWebReact: React.FC = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isProtected, setIsProtected] = useState<boolean>(false);

  useEffect(() => {
    // Check if SecureWeb is loaded
    if (window.SecureWeb) {
      setIsProtected(true);
      setCsrfToken(window.SecureWeb.getCSRFToken());
      console.log('[SecureWeb] React integration active');
    } else {
      console.warn('[SecureWeb] Not loaded. Add script tag to index.html');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    // SecureWeb automatically adds CSRF token to requests
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        csrfToken: window.SecureWeb?.getCSRFToken(),
        data: Object.fromEntries(formData)
      })
    });
    
    const result = await response.json();
    console.log('Submit result:', result);
  };

  return (
    <div className="secureweb-react">
      <h1>React Integration Example</h1>
      
      {isProtected ? (
        <div className="protection-status" style={{ color: 'green' }}>
          ✓ Protected by SecureWeb
        </div>
      ) : (
        <div className="protection-status" style={{ color: 'red' }}>
          ✗ Not protected - add script tag to index.html
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" required />
        </div>
        
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        
        <div>
          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" required />
        </div>
        
        <button type="submit">Submit</button>
      </form>
      
      {csrfToken && (
        <div className="debug-info">
          <small>CSRF Token: {csrfToken.substring(0, 16)}...</small>
        </div>
      )}
    </div>
  );
};

export default SecureWebReact;