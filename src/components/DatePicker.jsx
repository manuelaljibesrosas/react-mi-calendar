/** @jsx jsx */
import React from 'react';
import { jsx, css, keyframes } from '@emotion/core';
import styled from '@emotion/styled';
import {
  compose,
  lifecycle,
  withState,
  withHandlers,
} from 'recompose';
import PropTypes from 'prop-types';
import {
  add,
  sub,
  format,
} from 'date-fns/fp';
// components
import Arrow from '../svg/arrow.svg';
import RoundedBox from './RoundedBox';
import Button from './Button';

const slideUp = keyframes`
  from {
    transform: translate3d(0, 100%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: .5;
  }
  to {
    opacity: 1;
  }
`;

class Scroller extends React.Component {
  constructor(props) {
    super(props);

    this.actions = {
      INCREMENT: add,
      DECREMENT: sub,
    };

    this.count = 0;
    this.interval = 20;
    this.frameId = 0;
    this.step = this.props.step || 1;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleMouseDown(action) {
    const {
      value,
      onChange,
      unit,
      step,
    } = this.props;

    if (this.count === 0) {
      onChange(action({ [unit]: this.step })(value));
    }
    if (this.count > 20) { // offset until auto inc starts
      if (this.count % this.interval === 0) {
        onChange(action({ [unit]: this.step })(value));
      }
      // update interval value after 2s
      if (this.count > 60 * 2) {
        this.interval = 10;
      }
      // update interval value after 3s
      if (this.count > 60 * 3) {
        this.interval = 5;
      }
      // update step value after 4s
      if (this.count > 60 * 4) {
        this.step = step * 3;
      }
    }
    this.count++;
    this.frameId = requestAnimationFrame(() => this.handleMouseDown(action));
  }

  handleCancel() {
    this.count = 0;
    this.step = this.props.step || 1;
    this.interval = 20;
    cancelAnimationFrame(this.frameId);
  }

  render() {
    const {
      value,
      step = 1,
      unit,
      format: formatStr,
    } = this.props;

    return (
      <div
        css={css`
          display: flex; flex-direction: column; justify-content: space-between;
          height: 100%; align-items: center;
        `}
      >
        <div
          onMouseDown={() => this.handleMouseDown(this.actions.DECREMENT)}
          onMouseUp={this.handleCancel}
          onMouseOut={this.handleCancel}
          css={css`
            transform: rotate(-90deg);
            width: 15px; height: 15px;
            text-align: center;
            cursor: pointer;
          `}
        >
          <Arrow
            css={css`
              width: 100%; height: 100%;
            `}
          />
        </div>
        <div
          css={css`
            position: relative;
            display: flex; flex-direction: column; justify-content: space-around;
            align-items: center; height: 100%; padding: 10px 0;

            &:after {
              content: "";
              pointer-events: none;
              position: absolute; top: 0; left: 0;
              width: 100%; height: 100%;
              background-image: linear-gradient(to bottom, rgba(255, 255, 255, .5) 15%, transparent 25%, transparent 75%, rgba(255, 255, 255, .5) 85%);
            }
          `}
        >
          <div
            css={css`
              opacity: .5;
              user-select: none;
            `}
          >
            {compose(format(formatStr), sub({ [unit]: step }))(value)}
          </div>
          <div
            css={css`
              user-select: none;
            `}
          >
            {format(formatStr)(value)}
          </div>
          <div
            css={css`
              opacity: .5;
              user-select: none;
            `}
          >
            {compose(format(formatStr), add({ [unit]: step }))(value)}
          </div>
        </div>
        <div
          onMouseDown={() => this.handleMouseDown(this.actions.INCREMENT)}
          onMouseUp={this.handleCancel}
          onMouseOut={this.handleCancel}
          css={css`
            transform: rotate(90deg);
            width: 15px; height: 15px;
            text-align: center;
            cursor: pointer;
          `}
        >
          <Arrow
            css={css`
              width: 100%; height: 100%;
            `}
          />
        </div>
      </div>
    );
  }
}

const datePickerContainer = compose(
  withState('state', 'setState', ({ value }) => ({
    isOpened: false,
    internalValue: new Date(value),
    initialValue: new Date(value),
  })),
  withHandlers({
    open: ({ state, setState }) => () => setState({
      ...state,
      isOpened: true,
    }),
    close: ({ state, setState }) => () => setState({
      ...state,
      isOpened: false,
    }),
    handleChange: ({ state, setState }) => (value) => setState({
      ...state,
      internalValue: value,
    }),
  }),
  withHandlers({
    handleCancel: ({
      state: { initialValue },
      onChange,
      name,
      close,
    }) => () => {
      onChange(initialValue, name);
      close();
    },
  }),
);

const PureDatePicker = ({
  // state
  state: {
    isOpened,
    internalValue,
  },
  label,
  name,
  value,
  // actions
  handleCancel,
  handleChange,
  open,
  onChange,
  close,
}) => (
  <div
    onClick={open}
    css={css`
      display: flex; height: 35px; align-items: center;
      cursor: pointer;
    `}
  >
    <div
      css={css`
        font-weight: 500; font-size: 16px;
        user-select: none;
      `}
    >
      {label}
    </div>
    <div
      css={css`
        flex: 1;
        text-align: right; font-size: 14px;
        color: #8e8e8e;
        user-select: none;
      `}
    >
      {format('EEE, MMM d, yyyy hh:mm a')(value)}
    </div>
    {
      isOpened && (
        <div
          css={css`
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            overflow: hidden;
          `}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            css={css`
              animation: ${fadeIn} 170ms ease-in;
              position: absolute; top: 0; left: 0;
              width: 100%; height: 100%;
              background: rgba(0, 0, 0, .2);
            `}
          />
          <RoundedBox
            onClick={(e) => e.stopPropagation()}
            css={css`
              animation: ${slideUp} 170ms ease-in;
              position: absolute; left: 0; bottom: 0; z-index: 1;
              width: 100%; height: 400px; max-height: 80%; display: flex; flex-direction: column;
              border-radius: 22px 22px 0 0;
              cursor: default;
            `}
          >
            <div
              css={css`
                margin: 0 0 15px;
                display: flex; flex-direction: column; align-items: center; padding: 10px 0;
              `}
            >
              <h5
                css={css`
                  margin: 0 0 20px;
                  font-size: 16px; font-weight: 600;
                `}
              >
                {label}
              </h5>
              <h5
                css={css`
                  margin: 0;
                  font-size: 16px; font-weight: 400;
                `}
              >
                {format('EEE, MMM d, yyyy hh:mm a')(internalValue)}
              </h5>
            </div>
            <div
              css={css`
                margin-bottom: 15px;
                display: flex; width: 100%; justify-content: space-around; height: 100%; flex: 1; padding: 15px 0;
              `}
            >
              <div
                css={css`
                  margin-right: 10px;
                `}
              >
                <Scroller
                  value={internalValue}
                  format="EEE, MMM d"
                  unit="days"
                  onChange={handleChange}
                />
              </div>
              <div
                css={css`
                  margin-right: 10px;
                `}
              >
                <Scroller
                  value={internalValue}
                  format="H"
                  unit="hours"
                  onChange={handleChange}
                />
              </div>
              <div>
                <Scroller
                  value={internalValue}
                  format="m"
                  step={5}
                  unit="minutes"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div
              css={css`
                display: flex; justify-content: center;
              `}
            >
              <div
                css={css`
                  margin-right: 15px;
                `}
                onClick={handleCancel}
              >
                <Button label="Cancel" />
              </div>
              <div onClick={() => {
                onChange(internalValue, name);
                close();
              }}>
                <Button label="OK" color="#0398f8" />
              </div>
            </div>
          </RoundedBox>
        </div>
      )
    }
  </div>
);

export default datePickerContainer(PureDatePicker);

