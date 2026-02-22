import React, { useState } from 'react';

const Canvas = () => {
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulated login function (replace with your auth logic)
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="order-md-last">
      {isLoggedIn ? (
        // Cart content (shown when logged in)
        <>
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-primary">Log in</span>
            <span className="badge bg-primary rounded-pill">3</span>
          </h4>
          <ul className="list-group mb-3">
            <li className="list-group-item d-flex justify-content-between lh-sm">
              <div>
                <h6 className="my-0">Growers cider</h6>
                <small className="text-body-secondary">Brief description</small>
              </div>
              <span className="text-body-secondary">$12</span>
            </li>
            <li className="list-group-item d-flex justify-content-between lh-sm">
              <div>
                <h6 className="my-0">Fresh grapes</h6>
                <small className="text-body-secondary">Brief description</small>
              </div>
              <span className="text-body-secondary">$8</span>
            </li>
            <li className="list-group-item d-flex justify-content-between lh-sm">
              <div>
                <h6 className="my-0">Heinz tomato ketchup</h6>
                <small className="text-body-secondary">Brief description</small>
              </div>
              <span className="text-body-secondary">$5</span>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Total (USD)</span>
              <strong>$20</strong>
            </li>
          </ul>
          <button
            className="w-100 btn btn-primary btn-lg"
            type="button"
            onClick={() => alert('Proceeding to checkout...')}
          >
            Continue to Checkout
          </button>
        </>
      ) : (
        // Login prompt (shown when not logged in)
        <div className="text-center">
          <h4 className="mb-3 text-secondary">Please Log In</h4>
          <p className="text-muted mb-4">
            Sign in to view your cart and proceed to checkout.
          </p>
          <button
            className="w-100 btn btn-outline-primary btn-lg"
            type="button"
            onClick={handleLogin}
          >
            Log In
          </button>
        </div>
      )}
    </div>
  );
};

export default Canvas;