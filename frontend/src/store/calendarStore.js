import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useCalendarStore = create(
  devtools(
    (set) => ({
      // 상태
      calendarData: {}, // { 'YYYY-MM-DD': [todos] } 형태
      selectedDate: null,
      isLoading: false,
      error: null,

      // 액션: 캘린더 데이터 설정
      setCalendarData: (calendarData) =>
        set({ calendarData }, false, 'setCalendarData'),

      // 액션: 선택된 날짜 설정
      setSelectedDate: (date) => set({ selectedDate: date }, false, 'setSelectedDate'),

      // 액션: 특정 날짜의 할 일 가져오기
      getTodosByDate: (date) => (state) => {
        return state.calendarData[date] || [];
      },

      // 액션: 캘린더 데이터 가져오기 (API 호출용)
      fetchCalendarData: async (startDate, endDate) => {
        set({ isLoading: true, error: null }, false, 'fetchCalendarData/start');
        try {
          // API 호출 구현
          const response = await import('../services/calendarApi').then(api =>
            api.getCalendarData(startDate, endDate)
          );

          // 백엔드가 반환하는 형식: [{ date: 'YYYY-MM-DD', todos: [...], holidays: [...] }, ...]
          // 프론트엔드에서 사용할 형식: { 'YYYY-MM-DD': [todos], ... }
          const calendarMap = {};

          if (Array.isArray(response)) {
            // 백엔드에서 날짜별로 그룹화된 데이터를 받은 경우
            response.forEach(dayData => {
              if (dayData.date && dayData.todos) {
                const dateKey = dayData.date;
                // todos와 holidays를 합쳐서 저장
                calendarMap[dateKey] = [
                  ...dayData.todos,
                  ...(dayData.holidays || [])
                ];
              }
            });
          }

          set({
            calendarData: calendarMap,
            isLoading: false
          }, false, 'fetchCalendarData/success');
        } catch (error) {
          set(
            {
              error: error.message || '캘린더 데이터를 불러오는데 실패했습니다.',
              isLoading: false,
            },
            false,
            'fetchCalendarData/error'
          );
        }
      },

      // 액션: 로딩 상태 설정
      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      // 액션: 에러 설정
      setError: (error) => set({ error }, false, 'setError'),

      // 액션: 에러 초기화
      clearError: () => set({ error: null }, false, 'clearError'),

      // 액션: 모든 상태 초기화
      reset: () =>
        set(
          {
            calendarData: {},
            selectedDate: null,
            isLoading: false,
            error: null,
          },
          false,
          'reset'
        ),
    }),
    { name: 'CalendarStore' }
  )
);

export default useCalendarStore;
