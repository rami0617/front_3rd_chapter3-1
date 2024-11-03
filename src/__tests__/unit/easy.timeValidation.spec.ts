import { getTimeErrorMessage } from '../../utils/timeValidation';
import { expect } from 'vitest';

describe('getTimeErrorMessage >', () => {
  const errorMessage = {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  };

  const nullErrorMessage = {
    startTimeError: null,
    endTimeError: null,
  };

  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('10:00', '09:00')).toEqual(errorMessage);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('10:00', '10:00')).toEqual(errorMessage);
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('10:00', '12:00')).toEqual(nullErrorMessage);
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '12:00')).toEqual(nullErrorMessage);
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('10:00', '')).toEqual(nullErrorMessage);
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '')).toEqual(nullErrorMessage);
  });
});
