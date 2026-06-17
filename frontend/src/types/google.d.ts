interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
          [key: string]: unknown;
        }) => void;
        renderButton: (
          parent: HTMLElement | null,
          options: {
            theme?: "outline" | "filled_blue" | "filled_black";
            size?: "small" | "medium" | "large";
            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
            shape?: "rectangular" | "pill" | "circle" | "square";
            logo_alignment?: "left" | "center";
            width?: number;
            locale?: string;
            [key: string]: unknown;
          }
        ) => void;
        prompt: (callback?: (notification: unknown) => void) => void;
      };
    };
  };
}
