"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallbackTitle?: string;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <h2 className="text-xl font-semibold text-default-800">
            {this.props.fallbackTitle || "Что-то пошло не так"}
          </h2>
          <p className="text-sm text-default-500">
            Страница временно недоступна. Можно попробовать ещё раз или
            обновить страницу.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Попробовать снова
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-lg border border-default-300 px-4 py-2 text-sm font-medium text-default-700"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
