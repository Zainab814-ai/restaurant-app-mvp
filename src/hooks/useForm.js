import { useState, useCallback } from 'react';

export function useForm(initialValues = {}, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (validate) {
      const validationErrors = validate({ ...values, [name]: value });
      setErrors(validationErrors);
    }
  }, [validate, values]);

  const handleSubmit = useCallback((onSubmit) => {
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  }, [validate, values]);

  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return { values, errors, handleChange, handleSubmit, resetForm, isValid };
}