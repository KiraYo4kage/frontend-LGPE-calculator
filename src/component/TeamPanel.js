import React from 'react';
import { Card, Select, Button } from "antd";
import './TeamPanel.less';

export default ({ title, teamList = [], handleClearMember, handleChooseMember, handleSelectMember, handleAddMember, options }) => (
  <Card className="team-panel" title={title}>
    <Button type="primary" ghost onClick={handleClearMember}>清空</Button>
    {
      teamList.map((pm, index) => pm ? (
        <Card
          hoverable
          key={index}
          cover={
            <img alt="pm" src={
              `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${('000' + window.pokedex[pm].num).substr(-3)}${pm.includes('megay') ? '_f3' : pm.includes('mega') || pm.includes('alola') ? '_f2' : ''}.png`
            } />
          }
          type="inner"
          onClick={() => handleChooseMember(pm)}
        >
          { window.pokedex[pm].species }
        </Card>
      ) : (
        <Card key={index} type="inner">
          <Select
            autoFocus
            showSearch
            style={{ width: 200 }}
            placeholder="Select a pokemon"
            optionFilterProp="children"
            onChange={value => handleSelectMember(index, value)}
            filterOption={(input, option) => option.props.children.toLowerCase().includes(input)}
          >
            { options }
          </Select>
        </Card>
      ))
    }
    {teamList.length < 6 && <Card type="inner" hoverable onClick={handleAddMember}>+</Card> }
  </Card>
);
