import React, { Component } from 'react';
import { Card, Divider, Select, Button, InputNumber, Tooltip } from 'antd';
import pinyin from 'pinyin';
import './AbilityPanel.less';
import { damageWithStatus, attrWithStatus } from '../util/status';

export default class AbilityPanel extends Component {
  state = {
    statusTooltip: '',
  };

  attributeMap = {
    hp: '生命',
    atk: '攻击',
    def: '防御',
    spa: '特攻',
    spd: '特防',
    spe: '速度',
  };

  renderAttributes = () => {
    const { pokemon: { ability = {}, individual = {}, abLevel = {}, name, status }, abilityLevelOptions, handleSelectAbLevel, handleChangeIndividual } = this.props;
    return (
      <>
        <div className="attr-row">
          <div>能力项</div>
          <div>种族值</div>
          <div>个体值</div>
          <div>能力值</div>
          <div>阶级</div>
        </div>
        {
          Object.keys(ability).map((key) => (
            <div key={key} className="attr-row">
              <div>{this.attributeMap[key]}</div>
              <div>{window.pokedex[name].baseStats[key]}</div>
              <InputNumber value={individual[key] || 0} max={31} min={0} onChange={(value) => handleChangeIndividual(key, value)} />
              <div>{Math.floor(ability[key] * (abLevel[key] || 1) * attrWithStatus(status, key))}</div>
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                defaultValue={1}
                value={abLevel[key] || 1}
                onChange={(value) => handleSelectAbLevel(key, value)}
              >{abilityLevelOptions}</Select>
            </div>
          ))
        }
      </>
    );
  }

  changeStatus = (status) => {
    this.props.handleSelectStatus(status);
    this.setState({
      statusTooltip: window.statusCondition[status].description,
    });
  };

  renderExtra = () => {
    const { statusOptions, charactorOptions, handleSelectCharactor, pokemon: { ability, charactor, status } } = this.props;
    return (
      <>
        <Divider dashed>附加栏</Divider>
        <div className="extra-row">
          <div>性格:</div>
          <Select
            showSearch
            placeholder="Select a charactor"
            optionFilterProp="children"
            filterOption={(input, option) => pinyin(option.props.children[0], { style: pinyin.STYLE_NORMAL }).join('').toLowerCase().includes(input) || option.props.children[0].toLowerCase().includes(input)}
            defaultValue="Adamant"
            value={charactor}
            onChange={handleSelectCharactor}
          >
            {charactorOptions}
          </Select>
        </div>
        <Tooltip title={this.state.statusTooltip} placement="bottom">
          <div className="extra-row">
            <div>状态:</div>
            <Select
              showSearch
              placeholder="Select a status"
              optionFilterProp="children"
              filterOption={(input, option) => pinyin(option.props.children, { style: pinyin.STYLE_NORMAL }).join('').toLowerCase().includes(input) || option.props.children.toLowerCase().includes(input)}
              onChange={this.changeStatus}
              value={status}
              >
              {statusOptions}
            </Select>
            {
              status && <div>每回合损失{Math.ceil((ability || {}).hp * window.statusCondition[status]) || 0}</div>
            }
          </div>
        </Tooltip>
      </>
    )
  }

  render() {
    const { pokemon: { name, status }, moves, handleSelectMove, calculateDamage, options } = this.props;
    // TODO 增加显示先后手（根据实时速度、技能优先级）
    return (
      <Card
        className="ability-panel"
        title={name ? window.pokedex[name].species || 'PM' : 'PM'}
        extra={(name ? window.pokedex[name].types : []).map(
          type => <div key={type} className="attr-tag" style={{ backgroundColor: window.attribute[type].color }}>{window.attribute[type].chineseName}</div>
        )}
      >
        {
          this.renderAttributes()
        }
        {
          this.renderExtra()
        }
        <Divider dashed>技能栏</Divider>
        <div className="move-row">
          <div>名称</div>
          <div>属性</div>
          <div>类型</div>
          <div>威力</div>
          <div>命中</div>
          <div>伤害</div>
        </div>
        {
          moves.map((move, index) => (
            <div className="move-row" key={index}>
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select a move"
                optionFilterProp="children"
                onChange={value => handleSelectMove(index, value)}
                filterOption={(input, option) => pinyin(option.props.children, { style: pinyin.STYLE_NORMAL }).join('').toLowerCase().includes(input) || option.props.children.toLowerCase().includes(input)}
              >
                { options }
              </Select>
              <div>{ move.attribute }</div>
              <div>{ move.type }</div>
              <div>{ move.power }</div>
              <div>{ move.accuracy }</div>
              <div>{ move.damage }</div>
            </div>
          ))
        }
        <Button type="primary" onClick={calculateDamage}>计算伤害</Button>
      </Card>
    );
  }
}