/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import {
  add,
  sub,
  format,
} from 'date-fns/fp';
import Hammer from 'hammerjs';
import { tween } from '../store/animations';

class Scroller extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      range: [-5, 5],
    };
    this.trackingPoints = [];
    this.scrollOffsetY = 0;
    this.itemHeight = 50;
    this.stepsMoved = 0;
    this.initialValue = props.value;
    this.ref = React.createRef();
    this.count = 0;
    this.interval = 20;

    this.handleOnChange = this.handleOnChange.bind(this);
    this.addTrackingPoint = this.addTrackingPoint.bind(this);
    this.translateNodes = this.translateNodes.bind(this);
    this.getItemPosition = this.getItemPosition.bind(this);
  }

  getItemPosition(index) {
    return (
      ((index + 1) * this.itemHeight) - this.scrollOffsetY
    );
  }

  getRangeOfItems(deltaY) {
    const overscanStartIndex = -3;
    const itemHeight = 50;
    const renderedListLength = 7;

    const startIndex = overscanStartIndex + Math.floor(deltaY / itemHeight);

    return [startIndex, startIndex + renderedListLength];
  }

  translateNodes() {
    const { range } = this.state;
    const list = this.ref.current.childNodes.values();

    let node = list.next();
    let nodeIndex = 0;
    while (!node.done) {
      node.value.style.transform = `translateY(${this.getItemPosition(range[0] + nodeIndex)}px)`;
      node = list.next();
      nodeIndex++;
    }
  }

  addTrackingPoint(position) {
    const time = Date.now();
    while (this.trackingPoints.length > 0) {
      if (time - this.trackingPoints[0].time <= 100) {
        break;
      }
      this.trackingPoints.shift();
    }

    this.trackingPoints.push({ position, time });
  }

  handleOnChange() {
    const remainder = this.scrollOffsetY % this.itemHeight;
    let center;
    if (this.scrollOffsetY > 0) {
      if (remainder > this.itemHeight / 2) {
        center = this.scrollOffsetY + (this.itemHeight - remainder);
      } else {
        center = this.scrollOffsetY - remainder;
      }
    } else {
      if (Math.abs(remainder) > this.itemHeight / 2) {
        center = this.scrollOffsetY - remainder - this.itemHeight;
      } else {
        center = this.scrollOffsetY - remainder;
      }
    }
    const steps = center / 50;

    if (steps !== this.stepsMoved) {
      const {
        unit,
        format: formatStr,
        onChange,
      } = this.props;
      const value = compose(format(formatStr), add({ [unit]: steps }))(this.initialValue);
      onChange(value, formatStr);
      // this.props.onChange(this.props.unit, compose(format(this.props.formatStr), add({ [this.props.unit]: steps }))(this.initialValue));
      this.stepsMoved = steps;
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.value !== this.props.value) {
      return false;
    }
    return true;
  }

  componentDidMount() {
    let startScrollOffsetY = 0;
    const itemHeight = this.ref.current.firstChild.clientHeight;
    const directionTracker = {
      direction: 0,
      offset: 0,
    };
    const manager = new Hammer.Manager(this.ref.current);
    const pan = new Hammer.Pan({
      direction: Hammer.DIRECTION_VERTICAL,
    });
    manager.add(pan);
    manager.on('panstart', (e) => {
      startScrollOffsetY = this.scrollOffsetY;
      directionTracker.direction = e.direction;
    });
    manager.on('panmove', (e) => {
      this.scrollOffsetY = startScrollOffsetY - (e.deltaY / 2);
      this.translateNodes();

      const { range } = this.state;
      if (this.getItemPosition(range[0]) > -this.itemHeight) {
        const length = Math.ceil(this.getItemPosition(range[0]) / this.itemHeight) + 1;
        this.setState((s) => ({
          range: [range[0] - length, range[1] - length],
        }));
      }
      if (this.getItemPosition(range[1]) < 150) {
        const length = Math.ceil(this.getItemPosition(range[1]) / this.itemHeight) + 1;
        this.setState((s) => ({
          range: [range[0] + length, range[1] + length],
        }));
      }

      this.addTrackingPoint(this.scrollOffsetY);

      // onChange
      this.handleOnChange();
    });

    manager.on('panend', (e) => {
      this.addTrackingPoint(this.scrollOffsetY);
      const stopThreshold = 0.3;
      const friction = 0.92;
      const firstPoint = this.trackingPoints[0];
      const lastPoint = this.trackingPoints[this.trackingPoints.length - 1];
      const yOffset = lastPoint.position - firstPoint.position;
      const timeOffset = lastPoint.time - firstPoint.time;
      let decVelY = yOffset / (timeOffset / 15);
      let decelerating = true;
 
      requestAnimationFrame(stepDecelAnim.bind(this));

      function stepDecelAnim() {
        if (!decelerating) {
          return;
        }

        decVelY *= friction;

        if (Math.abs(decVelY) > stopThreshold) {
          this.scrollOffsetY += decVelY;
          this.translateNodes();

          const { range } = this.state;
          if (this.getItemPosition(range[0]) > -this.itemHeight) {
            const length = Math.ceil(this.getItemPosition(range[0]) / this.itemHeight) + 1;
            this.setState((s) => ({
              range: [range[0] - length, range[1] - length],
            }));
          }
          if (this.getItemPosition(range[1]) < 150) {
            const length = Math.ceil(this.getItemPosition(range[1]) / this.itemHeight) + 1;
            this.setState((s) => ({
              range: [range[0] + length, range[1] + length],
            }));
          }

          this.handleOnChange();

          // const ratio = this.scrollOffsetY / this.itemHeight;
          // const steps = ratio > 0 ?
          //   Math.floor(Math.abs(ratio)) :
          //   -Math.floor(Math.abs(ratio));

          // if (steps !== this.stepsMoved) {
          //   this.props.onChange(this.props.unit, steps - this.stepsMoved);
          //   this.stepsMoved = steps;
          // }
          requestAnimationFrame(stepDecelAnim.bind(this));
        } else {
          decelerating = false;

          const tweenFrom = this.scrollOffsetY;
          const remainder = this.scrollOffsetY % this.itemHeight;
          if (this.scrollOffsetY > 0) {
            if (remainder > this.itemHeight / 2) {
              this.scrollOffsetY = this.scrollOffsetY + (this.itemHeight - remainder);
            } else {
              this.scrollOffsetY = this.scrollOffsetY - remainder;
            }
          } else {
            if (Math.abs(remainder) > this.itemHeight / 2) {
              this.scrollOffsetY = this.scrollOffsetY - remainder - this.itemHeight;
            } else {
              this.scrollOffsetY = this.scrollOffsetY - remainder;
            }
          }
          tween({
            from: tweenFrom,
            to: this.scrollOffsetY,
            duration: 200,
            onUpdate: (value) => {
              this.scrollOffsetY = value;
              this.translateNodes();
            },
            onComplete: () => {
              // const ratio = this.scrollOffsetY / this.itemHeight;
              // const steps = ratio > 0 ?
              //   Math.floor(Math.abs(ratio)) :
              //   -Math.floor(Math.abs(ratio));

              // if (steps !== this.stepsMoved) {
              //   this.props.onChange(this.props.unit, steps - this.stepsMoved);
              //   this.stepsMoved = steps;
              // }

              // this.stepsMoved = 0;
              this.handleOnChange();
            },
          });
        }
      }
    });

  }

  render() {
    const {
      unit,
      format: formatStr,
    } = this.props;
    const { initialValue: value } = this;

    const { range } = this.state;
    const items = [];

    for (let index = range[0]; index <= range[1]; index++) {
      const label = compose(format(formatStr), add({ [unit]: index }))(value);
      const key = compose(format('yyyy MM d H m'), add({ [unit]: index }))(value);
      items.push((
        <div
          key={key}
          css={css`
            will-change: transform;
            position: absolute; top 0; transform: translateY(${this.getItemPosition(index)}px);
            display: flex; align-items: center; width: 100%;
            justify-content: center; height: ${this.itemHeight}px;
          `}
        >
          <span>
            {label}
          </span>
        </div>
      ));
    }

    return (
      <div
        css={css`
          display: flex; flex-direction: column; justify-content: space-between;
          height: 100%; align-items: center;
        `}
      >
        <div
          ref={this.ref}
          css={css`
            position: relative;
            height: 150px; width: 100%;
            overflow: hidden;

            &:after {
              content: "";
              pointer-events: none;
              position: absolute; top: 0; left: 0;
              width: 100%; height: 100%;
              background-image: linear-gradient(to bottom, rgba(255, 255, 255, .5) 15%, transparent 25%, transparent 75%, rgba(255, 255, 255, .5) 85%);
            }
          `}
        >
          {items}
        </div>
      </div>
    );
  }
}

export default Scroller;

