import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import "./styles.css";
import App from "./App";

type BoundaryState = { hasError: boolean; message: string };

class ErrorBoundary extends React.Component<React.PropsWithChildren, BoundaryState> {
  state: BoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error) {
    // Keep a console trail for debugging in browser dev tools.
    // eslint-disable-next-line no-console
    console.error("Application crashed:", error);
  }

  override render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: "'Segoe UI', sans-serif" }}>
        <h2 style={{ marginTop: 0 }}>Application Error</h2>
        <p>The app encountered a runtime error.</p>
        <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.message}</pre>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
