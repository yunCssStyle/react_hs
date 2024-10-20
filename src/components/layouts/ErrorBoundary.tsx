import React, { ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <h1>네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
