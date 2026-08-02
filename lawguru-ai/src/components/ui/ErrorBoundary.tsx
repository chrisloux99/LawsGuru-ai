"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { FaExclamationCircle, FaRedo } from "@/components/icons";
import Button from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glass-panel p-8 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-xl bg-zambia-red/10 border border-zambia-red/20 flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="w-7 h-7 text-zambia-red" />
          </div>
          <h3 className="font-heading text-lg font-bold text-earth-100 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-earth-400 font-body mb-6">
            An unexpected error occurred. You can try reloading this section.
          </p>
          <Button
            variant="copper"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2"
          >
            <FaRedo className="w-4 h-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
