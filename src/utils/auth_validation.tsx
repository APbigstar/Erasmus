export function validateEmail(email: string): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  export function validatePassword(password: string): { isValid: boolean; error: string } {
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter.' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter.' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number.' };
    }
    return { isValid: true, error: '' };
  }