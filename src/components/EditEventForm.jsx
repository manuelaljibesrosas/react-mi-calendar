/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
// components
import Cancel from '../svg/cancel.svg';
import Checkmark from '../svg/checkmark.svg';
import DatePicker from './DatePicker';

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const FormSection = styled.div`
  padding: 10px 20px;
`;

const Input = styled.input`
  height: 35px; width: 100%; border: none;
  font-size: 16px;

  &:focus {
    outline: none;
  }
`;

const EditEventForm = ({
  // state
  state,
  title,
  // actions
  handleFormSubmit,
  handleDatePickerChange,
  handleInputChange,
  goBack,
}) => (
  <div
    css={css`
      height: 100%;
      background: #fff;
    `}
  >
    <div
      css={css`
        display: flex; height: 40px; justify-content: space-between;
        align-items: center; padding: 0 20px;
        background-color: #f7f7f7;
      `}
    >
      <div
        css={css`
          height: 16px; width: 15px;
          cursor: pointer;
        `}
        onClick={goBack}
      >
        <Cancel
          css={css`
            height: 100%; width: 100%;
          `}
        />
      </div>
      <h3
        css={css`
          margin: 0;
          font-size: 16px; font-weight: 600;
        `}
      >
        {title}
      </h3>
      <div
        css={css`
          height: 16px; width: 22px;   
          cursor: pointer;
        `} 
        onClick={handleFormSubmit}
      >
        <Checkmark
          css={css`
            height: 100%; width: 100%;
          `}
        />
      </div>
    </div>
    <form onSubmit={(e) => e.preventDefault()}>
      <FormSection>
        <InputGroup>
          <Input
            type="text"
            name="name"
            placeholder="Event name"
            value={state.name}
            onChange={handleInputChange}
          />
        </InputGroup>
        <InputGroup>
          <DatePicker
            label="From"
            value={state.start}
            name="start"
            onChange={handleDatePickerChange}
          />
        </InputGroup>
        <InputGroup>
          <DatePicker
            label="To"
            value={state.end}
            name="end"
            onChange={handleDatePickerChange}
          />
        </InputGroup>
      </FormSection>
      <div
        css={css`
          height: 1px;
          background-color: #eee;
        `}
      />
      <FormSection>
        <InputGroup>
          <Input
            type="text"
            name="description"
            placeholder="Description"
            value={state.description}
            onChange={handleInputChange}
          />
        </InputGroup>
        <InputGroup>
          <Input
            type="text"
            name="location"
            placeholder="Location"
            value={state.location}
            onChange={handleInputChange}
          />
        </InputGroup>
      </FormSection>
    </form>
  </div>
);

EditEventForm.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  state: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  handleDatePickerChange: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
};

export default EditEventForm;

