import { inject } from 'vue';
import PropTypes from '../../_util/vue-types';
import get from 'lodash/get';
import classNames from '../../_util/classNames';
import { isValidElement } from '../../_util/props-util';

function isInvalidRenderCellText(text) {
  return (
    text && !isValidElement(text) && Object.prototype.toString.call(text) === '[object Object]'
  );
}

export default {
  name: 'TableCell',
  inheritAttrs: false,
  props: {
    record: PropTypes.object,
    prefixCls: PropTypes.string,
    index: PropTypes.number,
    indent: PropTypes.number,
    indentSize: PropTypes.number,
    column: PropTypes.object,
    expandIcon: PropTypes.any,
    component: PropTypes.any,
  },
  setup() {
    return {
      table: inject('table', {}),
    };
  },
  methods: {
    handleClick(e) {
      const {
        record,
        column: { onCellClick },
      } = this;
      if (onCellClick) {
        onCellClick(record, e);
      }
    },
  },

  render() {
    const {
      record,
      indentSize,
      prefixCls,
      indent,
      index,
      expandIcon,
      column,
      component: BodyCell,
    } = this;
    const { dataIndex, customRender, className = '' } = column;
    const { transformCellText } = this.table;
    // We should return undefined if no dataIndex is specified, but in order to
    // be compatible with object-path's behavior, we return the record object instead.
    let text;
    if (typeof dataIndex === 'number') {
      text = get(record, dataIndex);
    } else if (!dataIndex || dataIndex.length === 0) {
      text = record;
    } else {
      text = get(record, dataIndex);
    }
    let tdProps = {
      onClick: this.handleClick,
    };
    let colSpan;
    let rowSpan;

    if (customRender) {
      text = customRender({ text, record, index, column });
      if (isInvalidRenderCellText(text)) {
        tdProps = text.props || text.attrs || tdProps;
        ({ colSpan, rowSpan } = tdProps);
        text = text.children;
      }
    }

    if (column.customCell) {
      tdProps = { ...tdProps, ...column.customCell(record, index) };
    }

    // Fix https://github.com/ant-design/ant-design/issues/1202
    if (isInvalidRenderCellText(text)) {
      text = null;
    }

    if (transformCellText) {
      text = transformCellText({ text, column, record, index });
    }

    const indentText = expandIcon ? (
      <span
        style={{ paddingLeft: `${indentSize * indent}px` }}
        class={`${prefixCls}-indent indent-level-${indent}`}
      />
    ) : null;

    if (rowSpan === 0 || colSpan === 0) {
      return null;
    }
    if (column.align) {
      tdProps.style = { textAlign: column.align, ...tdProps.style };
    }

    const cellClassName = classNames(className, column.class, {
      [`${prefixCls}-cell-ellipsis`]: !!column.ellipsis,
      // 如果有宽度，增加断行处理
      // https://github.com/ant-design/ant-design/issues/13825#issuecomment-449889241
      [`${prefixCls}-cell-break-word`]: !!column.width,
    });

    if (column.ellipsis) {
      if (typeof text === 'string') {
        tdProps.title = text;
      } else if (text) {
        // const { props: textProps } = text;
        // if (textProps && textProps.children && typeof textProps.children === 'string') {
        //   tdProps.attrs.title = textProps.children;
        // }
      }
    }

    return (
      <BodyCell class={cellClassName} {...tdProps}>
        {indentText}
        {expandIcon}
        {text}
      </BodyCell>
    );
  },
};
