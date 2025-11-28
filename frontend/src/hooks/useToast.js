import { toast } from 'sonner';

const useToast = () => {
  return {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options),
    info: (message, options) => toast.info(message, options),
    warning: (message, options) => toast.warning(message, options),
    promise: (promise, messages, options) => toast.promise(promise, messages, options),
    dismiss: (id) => toast.dismiss(id),
    message: (message, options) => toast(message, options),
  };
};

export default useToast;