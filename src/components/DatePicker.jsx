/** @jsx jsx */
import React from 'react';
import { jsx, css, keyframes } from '@emotion/core';
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
  parse,
} from 'date-fns/fp';
// components
import Scroller from './Scroller';
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
    handleChange: ({ state, setState }) => (value, format) => (
      setState({
        ...state,
        internalValue: parse(state.internalValue)(format)(value),
      })
    ),
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
      font-family: Roboto, sans-serif;
      cursor: pointer;

      & * {
        box-sizing: border-box;
        user-select: none;
      }
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
                  flex: 1;
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
                  flex: 1;
                `}
              >
                <Scroller
                  value={internalValue}
                  format="H"
                  unit="hours"
                  onChange={handleChange}
                />
              </div>
              <div
                css={css`
                  flex: 1;
                `}
              >
                <Scroller
                  value={internalValue}
                  format="m"
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

