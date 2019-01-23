import React, { Component } from 'react';
import { Layout, Select, message } from 'antd';
import { request } from '../util/request';
import { debounce, throttle } from '../util/decorator';

import './Calculator.less';
import TeamPanel from '../component/TeamPanel';
import AbilityPanel from '../component/AbilityPanel';
import { damageWithStatus } from '../util/status';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
message.config({ maxCount: 1 });

export default class Calculator extends Component {
  state = {
    minDamage: 0,
    maxDamage: 0,
    myTeamList: ["beedrillmega", "mukalola", "melmetal", "snorlax", "aerodactyl", "lapras"],
    opTeamList: ["mewtwomegay"],
    myPokemon: {},
    opPokemon: {},
    myMoves: new Array(4).fill({}),
    opMoves: new Array(4).fill({}),
  };

  defaultIndividual = {
    hp: 31,
    atk: 31,
    def: 31,
    spa: 31,
    spd: 31,
    spe: 31,
  };

  pokedex = Object.keys(window.pokedex).map(pm => window.pokedex[pm]).filter(({ num }) => (num <= 153 || num >= 808) && num > 0);

  PMOptions = this.pokedex.map((pm, index) => <Option key={index} value={pm.species.replace(/-/g, '').toLowerCase()}>{pm.species}</Option>);

  moveOptions = window.moves.map((move, index) => <Option key={index} value={index}>{move.chineseName}</Option>);

  abilityLevelOptions = new Array(13).fill(0).map((_, index) => <Option key={index} value={
    index >= 6 ? (index - 6 + 2) / 2 : 2 / (2 - index + 6)
  }>{index - 6}</Option>).reverse();

  charactorOptions = Object.values(window.charactor).map((cha, index) => <Option key={index} value={cha.charactor}>{cha.chinese} {cha.increase}+/{cha.decrease}-</Option>);

  statusOptions = Object.keys(window.statusCondition).map((key) => <Option key={key} value={key}>{window.statusCondition[key].chineseName}</Option>)

  componentDidUpdate() {
    // console.log(this.state.myPokemon)
  }

  addTeamMember = (isOpponent = false) => {
    const list = isOpponent ? 'opTeamList' : 'myTeamList';
    this.setState({
      [list]: this.state[list].concat(''),
    });
  };

  clearMember = (isOpponent = false) => {
    const listName = isOpponent ? 'opTeamList' : 'myTeamList';
    this.setState({
      [listName]: [],
    });
  };

  selectMember = (isOpponent = false, index, species) => {
    const listName = isOpponent ? 'opTeamList' : 'myTeamList';
    const list = this.state[listName];
    this.setState({
      [listName]: [
        ...list.slice(0, index),
        species,
        ...list.slice(index + 1, list.length),
      ],
    });
  };

  chooseMember = async (isOpponent = false, pokemon) => {
    const belong = isOpponent ? 'opPokemon' : 'myPokemon';
    const { charactor } = this.state[belong];
    const { data: { ability } } = await request('/api/damage/ability', {
      individual: this.defaultIndividual,
      level: 50,
      pokemon,
      charactor,
    }, {
      method: 'post',
    });
    this.setState({
      [belong]: {
        name: pokemon,
        ability,
        abLevel: {},
        individual: this.defaultIndividual,
        charactor,
      },
    });
  };

  @debounce()
  async changeIndividual(isOpponent, key, value) {
    const belong = isOpponent ? 'opPokemon' : 'myPokemon';
    const pokemon = this.state[belong];
    const { individual, name, charactor } = pokemon;
    const newIndividual = {
      ...individual,
      [key]: value,
    };
    const { data: { ability } } = await request('/api/damage/ability', {
      individual: newIndividual,
      pokemon: name,
      level: 50,
      charactor,
    }, {
      method: 'post',
    });
    this.setState({
      [belong]: {
        ...pokemon,
        ability,
        individual: newIndividual,
      },
    });
  };

  selectAbilityLevel = (isOpponent = false, attribute, level) => {
    const belong = isOpponent ? 'opPokemon' : 'myPokemon';
    const pokemon = this.state[belong];
    const abLevel = pokemon.abLevel;
    this.setState({
      [belong]: {
        ...pokemon,
        abLevel: {
          ...abLevel,
          [attribute]: level,
        }
      },
    });
  };

  @debounce()
  async selectCharactor (isOpponent = false, charactor) {
    const belong = isOpponent ? 'opPokemon' : 'myPokemon';
    const pokemon = this.state[belong];
    if (!pokemon.ability) {
      message.warn('请先选择队伍中的宝可梦。');
      return;
    }
    const { data: { ability } } = await request('/api/damage/ability', {
      individual: pokemon.individual,
      pokemon: pokemon.name,
      level: 50,
      charactor,
    }, {
      method: 'post',
    });
    this.setState({
      [belong]: {
        ...pokemon,
        ability,
        charactor,
      }
    })
  };

  selectStatus = (isOpponent = false, status) => {
    const belong = isOpponent ? 'opPokemon' : 'myPokemon';
    const pokemon = this.state[belong];
    if (!pokemon.ability) {
      message.warn('请先选择队伍中的宝可梦。');
      return;
    }
    this.setState({
      [belong]: {
        ...pokemon,
        status,
      },
    });
  };

  selectMove = (isOpponent = false, index, move) => {
    const belong = isOpponent ? 'opMoves' : 'myMoves'
    const moves = this.state[belong];
    this.setState({
      [belong]: [
        ...moves.slice(0, index),
        window.moves[move],
        ...moves.slice(index + 1, moves.length),
      ],
    });
  };

  @throttle(1000)
  async calculateDamage(isOpponent = false) {
    const belong = isOpponent ? 'op' : 'my';
    const fetchMinDamage = (param) => request('/api/damage/min', param, { method: 'post' });
    const fetchMaxDamage = (param) => request('/api/damage/max', param, { method: 'post' });
    const attacker = this.state[`${belong}Pokemon`];
    const defender = this.state[`${belong === 'my' ? 'op' : 'my'}Pokemon`];
    const status = attacker.status;
    const paramGetter = ({ englishName: moveName }) => ({
      level: 50,
      attacker,
      defender,
      moveName,
    });
    if (!attacker.ability) {
      message.warn('请选择攻击方宝可梦。');
      return;
    } else if (!defender.ability) {
      message.warn('请选择防御方宝可梦。');
      return;
    } else if (!this.state[`${belong}Moves`].some(move => move.englishName)) {
      message.warn('请选择攻击技能。');
      return;
    }
    const reqMaxArr = this.state[`${belong}Moves`].map((move) => fetchMaxDamage(paramGetter(move)));
    const reqMinArr = this.state[`${belong}Moves`].map((move) => fetchMinDamage(paramGetter(move)));

    let result = await Promise.all([].concat(reqMinArr, reqMaxArr));
    result = result.map(obj => obj.data.maxDamage || obj.data.minDamage || '-');
    this.setState((prevState) => ({
      [`${belong}Moves`]: prevState[`${belong}Moves`].map((move, index) => ({
        ...move,
        damage: `${Math.floor(result[index] * damageWithStatus(status)) || result[index]} ~ ${Math.floor(result[result.length / 2 + index] * damageWithStatus(status)) || result[result.length / 2 + index]}`,
      })),
    }));
  };

  render() {
    const { myTeamList, opTeamList, myPokemon, opPokemon, myMoves, opMoves } = this.state;
    return (
      <Layout className="calculator-container">
        <Header>Welcome</Header>
        <Content>
          <TeamPanel
            title="你的队伍"
            teamList={myTeamList}
            options={this.PMOptions}
            handleClearMember={this.clearMember.bind(this, false)}
            handleAddMember={this.addTeamMember.bind(this, false)}
            handleSelectMember={this.selectMember.bind(this, false)}
            handleChooseMember={this.chooseMember.bind(this, false)}
          />
          <TeamPanel
            title="对手的队伍"
            teamList={opTeamList}
            options={this.PMOptions}
            handleClearMember={this.clearMember.bind(this, true)}
            handleAddMember={this.addTeamMember.bind(this, true)}
            handleSelectMember={this.selectMember.bind(this, true)}
            handleChooseMember={this.chooseMember.bind(this, true)}
          />
          <div className="ability-area">
            <AbilityPanel
              pokemon={myPokemon}
              moves={myMoves}
              options={this.moveOptions}
              abilityLevelOptions={this.abilityLevelOptions}
              charactorOptions={this.charactorOptions}
              statusOptions={this.statusOptions}
              handleChangeIndividual={this.changeIndividual.bind(this, false)}
              handleSelectAbLevel={this.selectAbilityLevel.bind(this, false)}
              handleSelectMove={this.selectMove.bind(this, false)}
              handleSelectCharactor={this.selectCharactor.bind(this, false)}
              handleSelectStatus={this.selectStatus.bind(this, false)}
              calculateDamage={this.calculateDamage.bind(this, false)}
            />
            <AbilityPanel
              pokemon={opPokemon}
              moves={opMoves}
              options={this.moveOptions}
              abilityLevelOptions={this.abilityLevelOptions}
              statusOptions={this.statusOptions}
              handleChangeIndividual={this.changeIndividual.bind(this, true)}
              charactorOptions={this.charactorOptions}
              handleSelectAbLevel={this.selectAbilityLevel.bind(this, true)}
              handleSelectMove={this.selectMove.bind(this, true)}
              handleSelectCharactor={this.selectCharactor.bind(this, true)}
              handleSelectStatus={this.selectStatus.bind(this, true)}
              calculateDamage={this.calculateDamage.bind(this, true)}
            />
          </div>
        </Content>
        <Footer>LGPE Calculator</Footer>
      </Layout>
    )
  }
}