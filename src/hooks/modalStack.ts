type CloseHandler = () => void;

const stack: CloseHandler[] = [];

export const modalStack = {
  push(onClose: CloseHandler): () => void {
    stack.push(onClose);
    return () => {
      const idx = stack.indexOf(onClose);
      if (idx !== -1) {
        stack.splice(idx, 1);
      }
    };
  },

  pop(): boolean {
    const top = stack.pop();
    if (top) {
      top();
      return true;
    }
    return false;
  },

  isOpen(): boolean {
    return stack.length > 0;
  },

  count(): number {
    return stack.length;
  },

  clear(): void {
    stack.length = 0;
  },
};
