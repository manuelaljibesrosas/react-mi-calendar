/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import { connect } from 'react-redux';
import {
  compose,
  lifecycle,
  mapProps,
} from 'recompose';
import PropTypes from 'prop-types';
import {
  isWithinInterval,
  isSameDay,
  getDate,
  setHours,
} from 'date-fns/fp';
// selectors
import {
  selectCursor,
  selectSelectedRange,
} from '../store/selectors';
// actions
import { setRange } from '../store/actions';
// components
import TypeFaceSansSerif from './TypeFaceSansSerif';
import RoundShape from './RoundShape';

const omit = (keys, obj) => {
  const ret = {};
  Object.keys(obj).forEach((k) => {
    if (keys.includes(k)) return;
    ret[k] = obj[k];
  });
  return ret;
};

const rangeStates = {
  BETWEEN: 'BETWEEN',
  START: 'START',
  SELECTION_START: 'SELECTION_START',
  END: 'END',
  ONLY: 'ONLY',
  NOT_IN_RANGE: 'NOT_IN_RANGE',
};

const isInRange = (date, range) => {
  if (!range.start) return rangeStates.NOT_IN_RANGE;

  if (isSameDay(range.start)(date) && !range.end) {
    return rangeStates.SELECTION_START;
  }

  if (!range.end) return rangeStates.NOT_IN_RANGE;

  if (isSameDay(range.start)(date) && !isSameDay(range.end)(date)) {
    return rangeStates.START;
  }

  // TODO: isBetween 'day'
  if (compose(isWithinInterval(range), setHours(23))(date)) {
    return rangeStates.BETWEEN;
  }

  if (isSameDay(range.start)(date) && isSameDay(range.end)(date)) {
    return rangeStates.ONLY;
  }

  if (isSameDay(range.end)(date)) {
    return rangeStates.END;
  }

  return rangeStates.NOT_IN_RANGE;
};

const getTint = (range) => (
  range === 'START'
  || range === 'END'
  || range === 'ONLY'
  || range === rangeStates.SELECTION_START
) && '#4b66ef';

const flicker = keyframes`
  from, to {
    opacity: 1;
  }
  50% {
    opacity: .75;
  }
`;

const getLabelColor = (dimmed) => (
  (dimmed)
    ? '#ccc'
    : 'inherit'
);

const getShapeTint = (tint) => tint || undefined;

const CalendarDayCell = ({
  // state
  day,
  dimmed,
  hasEvent,
  isSelected,
  rangeState: range,
  // actions
  onClick,
}) => (
  <div
    css={css`
      position: relative;
      height: 50px;
      cursor: pointer;
      user-select: none;

      ${
        (
          range !== rangeStates.NOT_IN_RANGE
          && range !== rangeStates.ONLY
          && range !== rangeStates.SELECTION_START
        )
          ? `&:before {
            content: "";
            position: absolute; top: 50%; left: 0; transform: translateY(-50%);
            width: 100%; height: 45px;
            background: #4b66ef5c;
          }`
          : ''
      }
      ${
        (range === 'END')
          ? `&:before {
            width: 50%;
          }`
          : ''
      }
      ${
        (range === 'START')
          ? `&:before {
            right: 0; left: auto;
            width: 50%;
          }`
          : ''
      }
    `}
    onClick={onClick}
  >
    <div
      css={css`
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);

        ${
          (range === rangeStates.SELECTION_START) && css`
            animation: ${flicker} .8s ease infinite;
          `
        }
      `}
    >
      <RoundShape size="45px" tinted={getShapeTint(getTint(range))} bordered={isSelected} />
    </div>
    <div
      css={css`
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      `}
    >
      {
        Boolean(hasEvent) && (
          <div
            css={css`
              position: absolute; top: -3px; left: 50%; transform: translateX(-50%);
              width: 3px; height: 3px;
              border-radius: 100%; background: ${range !== rangeStates.NOT_IN_RANGE ? '#fff' : '#ccc'};
            `}
          />
        )
      }
      <TypeFaceSansSerif size="16px" color={getLabelColor(dimmed)}>
        {day}
      </TypeFaceSansSerif>
    </div>
  </div>
);

CalendarDayCell.defaultProps = {
  dimmed: false,
  hasEvent: false,
  isSelected: false,
};

CalendarDayCell.propTypes = {
  day: PropTypes.number.isRequired,
  dimmed: PropTypes.bool,
  hasEvent: PropTypes.bool,
  isSelected: PropTypes.bool,
  rangeState: PropTypes.oneOf(Object.values(rangeStates)).isRequired,
  onClick: PropTypes.func.isRequired,
};

const calendarDayCellContainer = compose(
  connect(
    (state, ownProps) => ({
      rangeState: isInRange(
        ownProps.date,
        selectSelectedRange(state),
        selectCursor(state),
      ),
    }),
    (dispatch, ownProps) => ({
      onClick: (typeof ownProps.onClick === 'function')
        ? ownProps.onClick
        : () => dispatch(setRange(ownProps.date)),
    }),
  ),
  lifecycle({
    shouldComponentUpdate(nextProps) {
      if (this.props.rangeState !== nextProps.rangeState) {
        return true;
      }
      if (!isSameDay(nextProps.date)(this.props.date)) {
        return true;
      }
      return false;
    },
  }),
  mapProps((props) => ({
    ...omit(['date'], props),
    day: getDate()(props.date),
    isSelected: isSameDay(new Date())(props.date),
  })),
);

export default calendarDayCellContainer(CalendarDayCell);
