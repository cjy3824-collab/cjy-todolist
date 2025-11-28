import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Input } from './common';
import { isValidTodoTitle, isValidTodoDescription, isValidDateRange } from '../utils/validators';

// ISO 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  // ISO 8601 형식이면 날짜 부분만 추출
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  return dateString;
};

const TodoForm = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});

  // initialData가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: formatDateForInput(initialData.startDate),
        dueDate: formatDateForInput(initialData.dueDate),
      });
    } else {
      // 새 할 일 추가 시 폼 초기화
      setFormData({
        title: '',
        description: '',
        startDate: '',
        dueDate: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드의 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};

    // 제목 검증
    if (!formData.title.trim()) {
      newErrors.title = '제목은 필수 입력 항목입니다.';
    } else if (!isValidTodoTitle(formData.title)) {
      newErrors.title = '제목은 1-200자 이내여야 합니다.';
    }

    // 설명 검증
    if (formData.description && !isValidTodoDescription(formData.description)) {
      newErrors.description = '설명은 최대 2000자까지 입력할 수 있습니다.';
    }

    // 날짜 순서 검증
    if (formData.startDate && formData.dueDate) {
      if (!isValidDateRange(formData.startDate, formData.dueDate)) {
        newErrors.dueDate = '마감일은 시작일 이후여야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 빈 문자열을 null로 변환 (선택 필드)
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      startDate: formData.startDate || null,
      dueDate: formData.dueDate || null,
    };

    onSubmit(submitData);
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      dueDate: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? '할 일 수정' : '새 할 일 추가'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 제목 입력 */}
        <Input
          label="제목"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="할 일 제목을 입력하세요"
          required
          disabled={isLoading}
          maxLength={200}
        />

        {/* 설명 입력 */}
        <Input
          label="설명"
          type="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="할 일 설명을 입력하세요 (선택사항)"
          disabled={isLoading}
          rows={4}
          maxLength={2000}
        />

        {/* 날짜 입력 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="시작일"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
            disabled={isLoading}
          />

          <Input
            label="마감일"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            disabled={isLoading}
          />
        </div>

        {/* 버튼 그룹 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {initialData ? '수정하기' : '저장하기'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

TodoForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    startDate: PropTypes.string,
    dueDate: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default TodoForm;
