import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// actions
import { updateScrollTop } from '../../store/actions';

function trackScrollTop() {
  return function hoc(Component) {
    class TrackScrollTop extends React.Component {
      constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.animationFrameId = 0;
      }

      componentDidMount() {
        const { updateScrollTop } = this.props;
        const updateFrame = () => {
          updateScrollTop(this.ref.current.scrollTop);
          this.animationFrameId = requestAnimationFrame(updateFrame);
        };
        this.animationFrameId = requestAnimationFrame(updateFrame);
      }

      componentWillUnmount() {
        cancelAnimationFrame(this.animationFrameId);
      }

      render() {
        return <Component anchor={this.ref} {...this.props} />;
      }
    }

    TrackScrollTop.propTypes = {
      updateScrollTop: PropTypes.func.isRequired,
    };

    return connect(
      null,
      (dispatch) => ({
        updateScrollTop: (scrollTop) => dispatch(updateScrollTop(scrollTop)),
      }),
    )(TrackScrollTop);
  };
}

export default trackScrollTop;
